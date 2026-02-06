// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HusdFaucet
 * @author HumanAds
 * @notice Faucet for distributing hUSD to approved advertisers.
 *
 * Two claim modes:
 *   - claimWithSignature(): EIP-712 signed ticket from admin (primary, recommended)
 *   - claimOpen(): Simple cooldown-based faucet (can be disabled via openClaimEnabled)
 *
 * Setup:
 *   1. Deploy this contract
 *   2. Treasury calls husd.approve(thisContract, type(uint256).max)
 *   3. Admin signs claim tickets off-chain → advertiser calls claimWithSignature()
 *
 * Security:
 *   - ReentrancyGuard on all claim paths
 *   - SafeERC20 for non-standard token compatibility
 *   - Pausable for emergency stop
 *   - 2-step ownership transfer
 *   - EIP-712 signature verification (Sybil-resistant, AA/Safe wallet compatible)
 *   - Per-address nonce for replay protection
 *   - Pre-transfer allowance/balance checks with descriptive errors
 */

// ============================================
// Minimal interfaces (Remix-friendly, no imports needed)
// ============================================

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

library SafeERC20 {
    error SafeERC20TransferFromFailed(address token, address from, address to, uint256 amount);

    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, amount)
        );
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert SafeERC20TransferFromFailed(address(token), from, to, amount);
        }
    }
}

contract HusdFaucet {
    using SafeERC20 for IERC20;

    // ============================================
    // Constants
    // ============================================
    uint256 public constant MAX_CLAIM_AMOUNT = 10_000_000_000;  // 10,000 hUSD (6 decimals)
    uint256 public constant MIN_COOLDOWN = 60;                   // 1 minute minimum

    // EIP-712
    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address recipient,uint256 amount,uint256 deadline,uint256 nonce)");

    // ============================================
    // Immutables
    // ============================================
    IERC20 public immutable husd;
    bytes32 public immutable DOMAIN_SEPARATOR;

    // ============================================
    // State
    // ============================================
    address public treasury;
    address public owner;
    address public pendingOwner;
    address public signer;              // admin who signs claim tickets
    uint256 public openClaimAmount;     // amount for open claims (cooldown-based)
    uint256 public cooldown;            // seconds between open claims
    bool public paused;
    bool public openClaimEnabled;       // toggle for simple faucet mode
    uint256 public totalClaimed;
    uint256 private _reentrancyStatus;

    mapping(address => uint256) public nonces;       // EIP-712 replay protection
    mapping(address => uint256) public lastClaim;    // cooldown tracking (open claims)
    mapping(address => uint256) public claimCount;   // total claims per address
    mapping(address => uint256) public totalReceived; // total tokens received per address

    // ============================================
    // Events
    // ============================================
    event Claimed(address indexed claimer, uint256 amount, uint256 timestamp, bool withSignature);
    event OpenClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event SignerUpdated(address oldSigner, address newSigner);
    event OpenClaimToggled(bool enabled);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address account);
    event Unpaused(address account);

    // ============================================
    // Errors
    // ============================================
    error NotOwner();
    error NotPendingOwner();
    error IsPaused();
    error OpenClaimDisabled();
    error CooldownActive(uint256 nextClaimAt);
    error ZeroAddress();
    error AmountTooLarge(uint256 amount, uint256 max);
    error AmountZero();
    error CooldownTooShort(uint256 cooldown, uint256 min);
    error SignatureExpired(uint256 deadline);
    error InvalidSignature();
    error AllowanceTooLow(uint256 available, uint256 required);
    error TreasuryBalanceLow(uint256 available, uint256 required);

    // ============================================
    // Modifiers
    // ============================================
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert IsPaused();
        _;
    }

    modifier nonReentrant() {
        require(_reentrancyStatus != 2, "ReentrancyGuard: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    // ============================================
    // Constructor
    // ============================================
    /**
     * @param _husd           hUSD token contract
     * @param _treasury       Treasury address (must approve this contract)
     * @param _signer         Admin address that signs claim tickets
     * @param _openClaimAmt   Amount for open claims in base units (6 decimals)
     * @param _cooldown       Seconds between open claims (>= MIN_COOLDOWN)
     */
    constructor(
        address _husd,
        address _treasury,
        address _signer,
        uint256 _openClaimAmt,
        uint256 _cooldown
    ) {
        if (_husd == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        if (_signer == address(0)) revert ZeroAddress();
        if (_openClaimAmt == 0) revert AmountZero();
        if (_openClaimAmt > MAX_CLAIM_AMOUNT) revert AmountTooLarge(_openClaimAmt, MAX_CLAIM_AMOUNT);
        if (_cooldown < MIN_COOLDOWN) revert CooldownTooShort(_cooldown, MIN_COOLDOWN);

        husd = IERC20(_husd);
        treasury = _treasury;
        signer = _signer;
        openClaimAmount = _openClaimAmt;
        cooldown = _cooldown;
        owner = msg.sender;
        openClaimEnabled = false;  // disabled by default, use signature mode
        _reentrancyStatus = 1;

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256("HusdFaucet"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    // ============================================
    // Core: EIP-712 Signed Claim (Primary)
    // ============================================

    /**
     * @notice Claim hUSD with admin-signed ticket. Caller pays gas.
     * @dev    EIP-712 signature prevents Sybil and controls distribution.
     *         Compatible with EOA, AA wallets, Safe, etc.
     * @param amount   Token amount in base units
     * @param deadline Block timestamp after which signature expires
     * @param signature EIP-712 signature from signer (65 bytes: r+s+v)
     */
    function claimWithSignature(
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        // Validate
        if (block.timestamp > deadline) revert SignatureExpired(deadline);
        if (amount == 0) revert AmountZero();
        if (amount > MAX_CLAIM_AMOUNT) revert AmountTooLarge(amount, MAX_CLAIM_AMOUNT);

        // Consume nonce (replay protection)
        uint256 nonce = nonces[msg.sender];
        nonces[msg.sender] = nonce + 1;

        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            CLAIM_TYPEHASH,
            msg.sender,
            amount,
            deadline,
            nonce
        ));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        address recovered = _recover(digest, signature);
        if (recovered == address(0) || recovered != signer) revert InvalidSignature();

        // Execute transfer
        _executeClaim(msg.sender, amount, true);
    }

    // ============================================
    // Core: Open Claim (Simple faucet, toggle-able)
    // ============================================

    /**
     * @notice Simple cooldown-based claim. Must be enabled by owner.
     * @dev    For testing/bootstrapping. Disable in production via openClaimEnabled.
     */
    function claimOpen() external nonReentrant whenNotPaused {
        if (!openClaimEnabled) revert OpenClaimDisabled();

        uint256 last = lastClaim[msg.sender];
        if (last != 0 && block.timestamp < last + cooldown) {
            revert CooldownActive(last + cooldown);
        }

        lastClaim[msg.sender] = block.timestamp;
        _executeClaim(msg.sender, openClaimAmount, false);
    }

    // ============================================
    // Internal
    // ============================================

    function _executeClaim(address recipient, uint256 amount, bool withSignature) internal {
        // Pre-checks with descriptive errors (costs gas but saves debug time)
        uint256 allowanceAvailable = husd.allowance(treasury, address(this));
        if (allowanceAvailable < amount) revert AllowanceTooLow(allowanceAvailable, amount);

        uint256 balanceAvailable = husd.balanceOf(treasury);
        if (balanceAvailable < amount) revert TreasuryBalanceLow(balanceAvailable, amount);

        // Effects
        claimCount[recipient] += 1;
        totalReceived[recipient] += amount;
        totalClaimed += amount;

        // Interaction
        husd.safeTransferFrom(treasury, recipient, amount);

        emit Claimed(recipient, amount, block.timestamp, withSignature);
    }

    function _recover(bytes32 digest, bytes calldata signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        // EIP-2: restrict s to lower half order to prevent signature malleability
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
            return address(0);
        }
        if (v != 27 && v != 28) return address(0);

        return ecrecover(digest, v, r, s);
    }

    // ============================================
    // View
    // ============================================

    /// @notice Check if address can use open claim
    function canClaimOpen(address account) external view returns (bool allowed, uint256 nextClaimAt) {
        if (!openClaimEnabled) return (false, 0);
        uint256 last = lastClaim[account];
        if (last == 0) return (true, 0);
        uint256 next = last + cooldown;
        if (block.timestamp >= next) return (true, 0);
        return (false, next);
    }

    /// @notice Current nonce for an address (needed to build EIP-712 signature)
    function getNonce(address account) external view returns (uint256) {
        return nonces[account];
    }

    /// @notice Remaining treasury allowance for this faucet
    function remainingAllowance() external view returns (uint256) {
        return husd.allowance(treasury, address(this));
    }

    /// @notice Treasury hUSD balance
    function treasuryBalance() external view returns (uint256) {
        return husd.balanceOf(treasury);
    }

    // ============================================
    // Admin: Configuration
    // ============================================

    function setOpenClaimAmount(uint256 _amount) external onlyOwner {
        if (_amount == 0) revert AmountZero();
        if (_amount > MAX_CLAIM_AMOUNT) revert AmountTooLarge(_amount, MAX_CLAIM_AMOUNT);
        emit OpenClaimAmountUpdated(openClaimAmount, _amount);
        openClaimAmount = _amount;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        if (_cooldown < MIN_COOLDOWN) revert CooldownTooShort(_cooldown, MIN_COOLDOWN);
        emit CooldownUpdated(cooldown, _cooldown);
        cooldown = _cooldown;
    }

    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
        // Auto-pause to prevent claims against unapproved treasury
        if (!paused) {
            paused = true;
            emit Paused(msg.sender);
        }
    }

    function setSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) revert ZeroAddress();
        emit SignerUpdated(signer, _signer);
        signer = _signer;
    }

    function setOpenClaimEnabled(bool _enabled) external onlyOwner {
        openClaimEnabled = _enabled;
        emit OpenClaimToggled(_enabled);
    }

    // ============================================
    // Admin: Pause
    // ============================================

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ============================================
    // Admin: 2-Step Ownership Transfer
    // ============================================

    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        pendingOwner = _newOwner;
        emit OwnershipTransferStarted(owner, _newOwner);
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }
}
