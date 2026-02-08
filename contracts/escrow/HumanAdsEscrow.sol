// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HumanAdsEscrow
 * @author HumanAds
 * @notice On-chain escrow for HumanAds advertising deals.
 *
 * Lifecycle:
 *   1. Advertiser deposits hUSD via depositToDeal() — funds locked per deal
 *   2. Backend (ARBITER_ROLE) calls releaseToDeal() on mission completion
 *      → 10% platform fee to feeVault, 90% credited to operator pull-balance
 *   3. Operator calls withdraw() to pull accumulated hUSD
 *   4. On failure/expiry: refundDeal() returns remaining to advertiser
 *
 * Security:
 *   - OpenZeppelin v5 Upgradeable: UUPS, AccessControl, ReentrancyGuard, Pausable
 *   - Pull payment pattern (operators withdraw, contract never pushes)
 *   - SafeERC20 for all token transfers
 *   - EIP-2612 Permit support for gasless approval
 *   - Fee hard cap at 20% (2000 bps)
 *   - withdraw() is NOT pausable — operators can always exit
 *   - Checks-Effects-Interactions pattern throughout
 *   - __gap for storage upgrade safety
 */

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IHumanAdsEscrow} from "./IHumanAdsEscrow.sol";

contract HumanAdsEscrow is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IHumanAdsEscrow
{
    using SafeERC20 for IERC20;

    // ============================================
    // Constants
    // ============================================

    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    /// @notice Maximum fee in basis points (20%)
    uint16 public constant MAX_FEE_BPS = 2000;

    /// @notice Basis points denominator
    uint16 private constant _BPS_DENOMINATOR = 10000;

    // ============================================
    // Storage (upgradeable — order matters!)
    // ============================================

    /// @notice hUSD token
    IERC20 private _token;

    /// @notice Platform fee in basis points (1000 = 10%)
    uint16 private _platformFeeBps;

    /// @notice Address that receives platform fees
    address private _feeVault;

    /// @notice Deal escrow records
    mapping(bytes32 => DealEscrow) private _deals;

    /// @notice Withdrawable balances (pull payment)
    mapping(address => uint256) private _withdrawableBalances;

    /// @dev Reserved storage for future upgrades
    uint256[45] private __gap;

    // ============================================
    // Initializer (replaces constructor for UUPS)
    // ============================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the escrow contract.
     * @param tokenAddress  hUSD token address
     * @param feeVaultAddr  Address to receive platform fees
     * @param feeBps        Platform fee in basis points (e.g. 1000 = 10%)
     * @param admin         Address granted DEFAULT_ADMIN_ROLE
     * @param arbiter       Address granted ARBITER_ROLE (backend/treasury)
     */
    function initialize(
        address tokenAddress,
        address feeVaultAddr,
        uint16 feeBps,
        address admin,
        address arbiter
    ) external initializer {
        if (tokenAddress == address(0)) revert ZeroAddress();
        if (feeVaultAddr == address(0)) revert ZeroAddress();
        if (admin == address(0)) revert ZeroAddress();
        if (arbiter == address(0)) revert ZeroAddress();
        if (feeBps > MAX_FEE_BPS) revert FeeTooHigh(feeBps, MAX_FEE_BPS);

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _token = IERC20(tokenAddress);
        _feeVault = feeVaultAddr;
        _platformFeeBps = feeBps;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ARBITER_ROLE, arbiter);
    }

    // ============================================
    // Advertiser: Deposit
    // ============================================

    /**
     * @notice Deposit hUSD into escrow for a deal.
     * @dev    Advertiser must have approved this contract for `amount` beforehand.
     * @param dealId          Unique deal identifier
     * @param amount          hUSD amount in base units (6 decimals)
     * @param maxParticipants Maximum number of operators for this deal
     * @param expiresAt       Timestamp after which advertiser can self-refund
     */
    function depositToDeal(
        bytes32 dealId,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt
    ) external override nonReentrant whenNotPaused {
        _deposit(dealId, msg.sender, amount, maxParticipants, expiresAt);
    }

    /**
     * @notice Deposit with EIP-2612 permit (gasless approval).
     * @param dealId          Unique deal identifier
     * @param amount          hUSD amount in base units (6 decimals)
     * @param maxParticipants Maximum number of operators for this deal
     * @param expiresAt       Timestamp after which advertiser can self-refund
     * @param deadline        Permit deadline
     * @param v               Signature v
     * @param r               Signature r
     * @param s               Signature s
     */
    function depositToDealWithPermit(
        bytes32 dealId,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override nonReentrant whenNotPaused {
        // Use try/catch: permit may revert if already approved or replay
        try IERC20Permit(address(_token)).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        ) {} catch {} // solhint-disable-line no-empty-blocks

        _deposit(dealId, msg.sender, amount, maxParticipants, expiresAt);
    }

    /**
     * @notice Deposit hUSD on behalf of an advertiser using EIP-2612 permit.
     * @dev    ARBITER only. Advertiser signs gasless permit, Treasury submits.
     *         The deal records the real advertiser address (not msg.sender).
     * @param dealId          Unique deal identifier
     * @param advertiser      Real advertiser address (token owner)
     * @param amount          hUSD amount in base units (6 decimals)
     * @param maxParticipants Maximum number of operators for this deal
     * @param expiresAt       Timestamp after which advertiser can self-refund
     * @param deadline        Permit deadline
     * @param v               Signature v
     * @param r               Signature r
     * @param s               Signature s
     */
    function depositOnBehalfWithPermit(
        bytes32 dealId,
        address advertiser,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override onlyRole(ARBITER_ROLE) nonReentrant whenNotPaused {
        if (advertiser == address(0)) revert ZeroAddress();
        // Use try/catch: permit may revert if already approved or replay
        try IERC20Permit(address(_token)).permit(
            advertiser,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        ) {} catch {} // solhint-disable-line no-empty-blocks
        _deposit(dealId, advertiser, amount, maxParticipants, expiresAt);
    }

    // ============================================
    // Arbiter: Release & Refund
    // ============================================

    /**
     * @notice Release funds to an operator after mission completion.
     * @dev    10% fee to feeVault, 90% to operator's pull balance.
     * @param dealId       Deal identifier
     * @param operator     Operator address to credit
     * @param rewardAmount Total reward amount (fee is deducted from this)
     */
    function releaseToDeal(
        bytes32 dealId,
        address operator,
        uint128 rewardAmount
    ) external override onlyRole(ARBITER_ROLE) nonReentrant whenNotPaused {
        _release(dealId, operator, rewardAmount);
    }

    /**
     * @notice Batch release to multiple operators in one transaction.
     * @param dealId    Deal identifier
     * @param operators Array of operator addresses
     * @param amounts   Array of reward amounts (parallel to operators)
     */
    function batchRelease(
        bytes32 dealId,
        address[] calldata operators,
        uint128[] calldata amounts
    ) external override onlyRole(ARBITER_ROLE) nonReentrant whenNotPaused {
        if (operators.length != amounts.length) revert ArrayLengthMismatch();

        for (uint256 i; i < operators.length; ++i) {
            _release(dealId, operators[i], amounts[i]);
        }
    }

    /**
     * @notice Refund remaining escrowed funds to the advertiser.
     * @dev    ARBITER can refund anytime. Advertiser can refund after expiry.
     * @param dealId Deal identifier
     */
    function refundDeal(bytes32 dealId)
        external
        override
        nonReentrant
        whenNotPaused
    {
        DealEscrow storage deal = _deals[dealId];
        if (deal.advertiser == address(0)) revert DealNotFound(dealId);
        if (deal.status != DealStatus.Active) revert DealNotActive(dealId);

        bool isArbiter = hasRole(ARBITER_ROLE, msg.sender);
        bool isAdvertiser = msg.sender == deal.advertiser;

        if (!isArbiter && !isAdvertiser) {
            revert NotAdvertiserOrArbiter(dealId);
        }

        // Advertiser can only refund after expiry
        if (isAdvertiser && !isArbiter) {
            if (block.timestamp < deal.expiresAt) {
                revert DealNotExpired(dealId, deal.expiresAt);
            }
        }

        uint128 remaining = deal.totalDeposited - deal.totalReleased - deal.totalRefunded;
        if (remaining == 0) revert InvalidAmount();

        // Effects
        deal.totalRefunded += remaining;
        deal.status = DealStatus.Cancelled;

        // Interaction
        _token.safeTransfer(deal.advertiser, remaining);

        emit DealRefunded(dealId, deal.advertiser, remaining);
    }

    /**
     * @notice Mark a deal as completed (no more releases/refunds possible).
     * @param dealId Deal identifier
     */
    function completeDeal(bytes32 dealId)
        external
        override
        onlyRole(ARBITER_ROLE)
        nonReentrant
    {
        DealEscrow storage deal = _deals[dealId];
        if (deal.advertiser == address(0)) revert DealNotFound(dealId);
        if (deal.status != DealStatus.Active) revert DealNotActive(dealId);

        // Refund any remaining balance to advertiser
        uint128 remaining = deal.totalDeposited - deal.totalReleased - deal.totalRefunded;
        if (remaining > 0) {
            deal.totalRefunded += remaining;
            _token.safeTransfer(deal.advertiser, remaining);
            emit DealRefunded(dealId, deal.advertiser, remaining);
        }

        deal.status = DealStatus.Completed;
        emit DealCompleted(dealId);
    }

    // ============================================
    // Operator: Withdraw (NOT pausable)
    // ============================================

    /**
     * @notice Withdraw accumulated balance to caller's address.
     * @dev    NOT pausable — operators can always exit.
     */
    function withdraw() external override nonReentrant {
        _withdraw(msg.sender, msg.sender);
    }

    /**
     * @notice Withdraw accumulated balance to a different address.
     * @param recipient Address to send funds to
     */
    function withdrawTo(address recipient) external override nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();
        _withdraw(msg.sender, recipient);
    }

    // ============================================
    // Admin: Configuration
    // ============================================

    /**
     * @notice Update platform fee.
     * @param feeBps New fee in basis points (capped at MAX_FEE_BPS = 2000 = 20%)
     */
    function setPlatformFee(uint16 feeBps)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (feeBps > MAX_FEE_BPS) revert FeeTooHigh(feeBps, MAX_FEE_BPS);
        uint16 old = _platformFeeBps;
        _platformFeeBps = feeBps;
        emit PlatformFeeUpdated(old, feeBps);
    }

    /**
     * @notice Update fee vault address.
     * @param vault New fee vault address
     */
    function setFeeVault(address vault)
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (vault == address(0)) revert ZeroAddress();
        address old = _feeVault;
        _feeVault = vault;
        emit FeeVaultUpdated(old, vault);
    }

    /**
     * @notice Pause deposits and releases. withdraw() remains operational.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause deposits and releases.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============================================
    // View
    // ============================================

    function getDeal(bytes32 dealId)
        external
        view
        override
        returns (DealEscrow memory)
    {
        return _deals[dealId];
    }

    function getWithdrawableBalance(address account)
        external
        view
        override
        returns (uint256)
    {
        return _withdrawableBalances[account];
    }

    function platformFeeBps() external view override returns (uint16) {
        return _platformFeeBps;
    }

    function feeVault() external view override returns (address) {
        return _feeVault;
    }

    function token() external view override returns (address) {
        return address(_token);
    }

    // ============================================
    // Internal
    // ============================================

    function _deposit(
        bytes32 dealId,
        address advertiser,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt
    ) internal {
        if (amount == 0) revert InvalidAmount();
        if (maxParticipants == 0) revert InvalidMaxParticipants();
        if (expiresAt <= block.timestamp) revert InvalidExpiresAt();
        if (_deals[dealId].advertiser != address(0)) {
            revert DealAlreadyExists(dealId);
        }

        // Effects
        _deals[dealId] = DealEscrow({
            advertiser: advertiser,
            totalDeposited: amount,
            totalReleased: 0,
            totalRefunded: 0,
            maxParticipants: maxParticipants,
            currentReleased: 0,
            status: DealStatus.Active,
            expiresAt: expiresAt
        });

        // Interaction
        _token.safeTransferFrom(advertiser, address(this), amount);

        emit DealDeposited(dealId, advertiser, amount, maxParticipants, expiresAt);
    }

    function _release(
        bytes32 dealId,
        address operator,
        uint128 rewardAmount
    ) internal {
        if (operator == address(0)) revert ZeroAddress();
        if (rewardAmount == 0) revert InvalidAmount();

        DealEscrow storage deal = _deals[dealId];
        if (deal.advertiser == address(0)) revert DealNotFound(dealId);
        if (deal.status != DealStatus.Active) revert DealNotActive(dealId);
        if (deal.currentReleased >= deal.maxParticipants) {
            revert MaxParticipantsReached(dealId, deal.maxParticipants);
        }

        uint128 remaining = deal.totalDeposited - deal.totalReleased - deal.totalRefunded;
        if (rewardAmount > remaining) {
            revert InsufficientDealBalance(dealId, remaining, rewardAmount);
        }

        // Calculate fee split
        uint128 feeAmount = (rewardAmount * _platformFeeBps) / _BPS_DENOMINATOR;
        uint128 operatorAmount = rewardAmount - feeAmount;

        // Effects
        deal.totalReleased += rewardAmount;
        deal.currentReleased += 1;

        // Credit operator pull balance
        _withdrawableBalances[operator] += operatorAmount;

        // Credit fee vault pull balance
        if (feeAmount > 0) {
            _withdrawableBalances[_feeVault] += feeAmount;
        }

        emit FundsReleased(dealId, operator, operatorAmount, feeAmount);
    }

    function _withdraw(address from, address recipient) internal {
        uint256 balance = _withdrawableBalances[from];
        if (balance == 0) revert NothingToWithdraw();

        // Effects
        _withdrawableBalances[from] = 0;

        // Interaction
        _token.safeTransfer(recipient, balance);

        emit Withdrawn(from, recipient, uint128(balance));
    }

    // ============================================
    // UUPS
    // ============================================

    /// @dev Only DEFAULT_ADMIN_ROLE can upgrade.
    function _authorizeUpgrade(address)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {} // solhint-disable-line no-empty-blocks
}
