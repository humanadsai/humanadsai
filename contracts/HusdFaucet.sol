// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HusdFaucet
 * @notice Advertiser calls claim() to receive hUSD from Treasury.
 *         Advertiser pays gas. Treasury pays tokens via approve + transferFrom.
 *
 * Setup:
 *   1. Deploy this contract
 *   2. Treasury calls husd.approve(thisContract, type(uint256).max)
 *   3. Advertiser calls claim() → receives claimAmount of hUSD
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract HusdFaucet {
    // ============================================
    // State
    // ============================================
    IERC20 public immutable husd;
    address public treasury;
    address public owner;
    uint256 public claimAmount;   // in base units (6 decimals: 1000 hUSD = 1_000_000_000)
    uint256 public cooldown;      // seconds between claims per address

    mapping(address => uint256) public lastClaim;

    // ============================================
    // Events
    // ============================================
    event Claimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event ClaimAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event OwnerUpdated(address oldOwner, address newOwner);

    // ============================================
    // Modifiers
    // ============================================
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ============================================
    // Constructor
    // ============================================
    /**
     * @param _husd        hUSD token contract address
     * @param _treasury    Treasury address that holds hUSD and has approved this contract
     * @param _claimAmount Amount per claim in base units (6 decimals)
     * @param _cooldown    Seconds between claims per address (e.g. 86400 = 24h)
     */
    constructor(
        address _husd,
        address _treasury,
        uint256 _claimAmount,
        uint256 _cooldown
    ) {
        require(_husd != address(0), "Invalid husd");
        require(_treasury != address(0), "Invalid treasury");

        husd = IERC20(_husd);
        treasury = _treasury;
        claimAmount = _claimAmount;
        cooldown = _cooldown;
        owner = msg.sender;
    }

    // ============================================
    // Core
    // ============================================

    /**
     * @notice Claim hUSD from treasury. Caller pays gas, receives tokens.
     */
    function claim() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + cooldown,
            "Cooldown active"
        );

        lastClaim[msg.sender] = block.timestamp;

        bool ok = husd.transferFrom(treasury, msg.sender, claimAmount);
        require(ok, "Transfer failed - check treasury approval and balance");

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    /**
     * @notice Check if an address can claim now
     */
    function canClaim(address account) external view returns (bool allowed, uint256 nextClaimAt) {
        uint256 next = lastClaim[account] + cooldown;
        if (block.timestamp >= next) {
            return (true, 0);
        }
        return (false, next);
    }

    /**
     * @notice Check remaining treasury allowance for this faucet
     */
    function remainingAllowance() external view returns (uint256) {
        return husd.allowance(treasury, address(this));
    }

    /**
     * @notice Check treasury hUSD balance
     */
    function treasuryBalance() external view returns (uint256) {
        return husd.balanceOf(treasury);
    }

    // ============================================
    // Admin
    // ============================================

    function setClaimAmount(uint256 _amount) external onlyOwner {
        emit ClaimAmountUpdated(claimAmount, _amount);
        claimAmount = _amount;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        emit CooldownUpdated(cooldown, _cooldown);
        cooldown = _cooldown;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner");
        emit OwnerUpdated(owner, _newOwner);
        owner = _newOwner;
    }
}
