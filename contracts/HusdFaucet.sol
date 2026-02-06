// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HusdFaucet
 * @author HumanAds
 * @notice Advertiser calls claim() to receive hUSD from Treasury.
 *         Advertiser pays gas. Treasury pays tokens via approve + transferFrom.
 *
 * Setup:
 *   1. Deploy this contract
 *   2. Treasury calls husd.approve(thisContract, type(uint256).max)
 *   3. Advertiser calls claim() → receives claimAmount of hUSD
 *
 * Security:
 *   - ReentrancyGuard on claim()
 *   - SafeERC20 for non-standard token compatibility
 *   - Pausable for emergency stop
 *   - 2-step ownership transfer
 *   - Max claim amount cap
 *   - EOA-only claim (no contract callers)
 */

// ============================================
// Minimal OpenZeppelin interfaces (Remix-friendly, no imports needed)
// ============================================

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @dev SafeERC20: handles tokens that don't return bool (e.g. USDT)
 */
library SafeERC20 {
    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transferFrom failed");
    }
}

contract HusdFaucet {
    using SafeERC20 for IERC20;

    // ============================================
    // Constants
    // ============================================
    /// @notice Maximum claimAmount that owner can set (10,000 hUSD = 10_000_000_000 base units)
    uint256 public constant MAX_CLAIM_AMOUNT = 10_000_000_000;

    // ============================================
    // State
    // ============================================
    IERC20 public immutable husd;
    address public treasury;
    address public owner;
    address public pendingOwner;           // 2-step ownership transfer
    uint256 public claimAmount;            // base units (6 decimals: 1000 hUSD = 1_000_000_000)
    uint256 public cooldown;               // seconds between claims per address
    bool public paused;                    // emergency pause
    uint256 public totalClaimed;           // cumulative tokens distributed
    uint256 private _reentrancyStatus;     // 1 = not entered, 2 = entered

    mapping(address => uint256) public lastClaim;
    mapping(address => uint256) public claimCount;  // total claims per address

    // ============================================
    // Events
    // ============================================
    event Claimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address account);
    event Unpaused(address account);

    // ============================================
    // Errors (custom errors save gas vs require strings)
    // ============================================
    error NotOwner();
    error NotPendingOwner();
    error IsPaused();
    error CooldownActive(uint256 nextClaimAt);
    error ZeroAddress();
    error AmountExceedsMax(uint256 amount, uint256 max);
    error OnlyEOA();

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
     * @param _husd        hUSD token contract address
     * @param _treasury    Treasury address (must approve this contract)
     * @param _claimAmount Amount per claim in base units (6 decimals)
     * @param _cooldown    Seconds between claims per address (e.g. 86400 = 24h)
     */
    constructor(
        address _husd,
        address _treasury,
        uint256 _claimAmount,
        uint256 _cooldown
    ) {
        if (_husd == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        if (_claimAmount == 0 || _claimAmount > MAX_CLAIM_AMOUNT) {
            revert AmountExceedsMax(_claimAmount, MAX_CLAIM_AMOUNT);
        }

        husd = IERC20(_husd);
        treasury = _treasury;
        claimAmount = _claimAmount;
        cooldown = _cooldown;
        owner = msg.sender;
        _reentrancyStatus = 1;
    }

    // ============================================
    // Core
    // ============================================

    /**
     * @notice Claim hUSD from treasury. Caller pays gas, receives tokens.
     * @dev CEI pattern + ReentrancyGuard + SafeERC20. EOA-only.
     */
    function claim() external nonReentrant whenNotPaused {
        // EOA-only: prevent contract-based Sybil bots
        if (msg.sender != tx.origin) revert OnlyEOA();

        uint256 last = lastClaim[msg.sender];
        if (last != 0 && block.timestamp < last + cooldown) {
            revert CooldownActive(last + cooldown);
        }

        // Effects (before interaction - CEI)
        uint256 amount = claimAmount;
        lastClaim[msg.sender] = block.timestamp;
        claimCount[msg.sender] += 1;
        totalClaimed += amount;

        // Interaction
        husd.safeTransferFrom(treasury, msg.sender, amount);

        emit Claimed(msg.sender, amount, block.timestamp);
    }

    // ============================================
    // View
    // ============================================

    /**
     * @notice Check if an address can claim now
     * @param account Address to check
     * @return allowed True if claim is available
     * @return nextClaimAt Timestamp when next claim is available (0 if allowed)
     */
    function canClaim(address account) external view returns (bool allowed, uint256 nextClaimAt) {
        uint256 last = lastClaim[account];
        // Never claimed → allowed
        if (last == 0) {
            return (true, 0);
        }
        uint256 next = last + cooldown;
        if (block.timestamp >= next) {
            return (true, 0);
        }
        return (false, next);
    }

    /// @notice Remaining treasury allowance for this faucet
    function remainingAllowance() external view returns (uint256) {
        return husd.allowance(treasury, address(this));
    }

    /// @notice Treasury hUSD balance
    function treasuryBalance() external view returns (uint256) {
        return husd.balanceOf(treasury);
    }

    /// @notice Number of claims an address has made
    function getClaimCount(address account) external view returns (uint256) {
        return claimCount[account];
    }

    // ============================================
    // Admin
    // ============================================

    /// @notice Update claim amount (capped by MAX_CLAIM_AMOUNT, non-zero)
    function setClaimAmount(uint256 _amount) external onlyOwner {
        if (_amount == 0 || _amount > MAX_CLAIM_AMOUNT) {
            revert AmountExceedsMax(_amount, MAX_CLAIM_AMOUNT);
        }
        emit ClaimAmountUpdated(claimAmount, _amount);
        claimAmount = _amount;
    }

    /// @notice Update cooldown period
    function setCooldown(uint256 _cooldown) external onlyOwner {
        emit CooldownUpdated(cooldown, _cooldown);
        cooldown = _cooldown;
    }

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    // ============================================
    // Pause
    // ============================================

    /// @notice Pause claims (emergency stop)
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Unpause claims
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // ============================================
    // 2-Step Ownership Transfer
    // ============================================

    /// @notice Start ownership transfer (new owner must call acceptOwnership)
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        pendingOwner = _newOwner;
        emit OwnershipTransferStarted(owner, _newOwner);
    }

    /// @notice Accept ownership (must be called by pending owner)
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }
}
