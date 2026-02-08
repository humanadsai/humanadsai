// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IHumanAdsEscrow
 * @author HumanAds
 * @notice Interface for the HumanAds on-chain escrow contract.
 */
interface IHumanAdsEscrow {
    // ============================================
    // Enums
    // ============================================

    enum DealStatus {
        Active,     // Funds locked, operators can be paid
        Completed,  // All participants paid or deal closed
        Cancelled,  // Advertiser cancelled (partial refund possible)
        Expired     // Past expiry, advertiser can self-refund
    }

    // ============================================
    // Structs
    // ============================================

    struct DealEscrow {
        address advertiser;       // Who deposited
        uint128 totalDeposited;   // hUSD base units (6 decimals)
        uint128 totalReleased;    // Released to operators so far
        uint128 totalRefunded;    // Refunded to advertiser so far
        uint32  maxParticipants;  // Max operators for this deal
        uint32  currentReleased;  // Number of operators paid
        DealStatus status;        // Current deal status
        uint64  expiresAt;        // Timestamp after which advertiser can self-refund
    }

    // ============================================
    // Events
    // ============================================

    event DealDeposited(
        bytes32 indexed dealId,
        address indexed advertiser,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt
    );

    event FundsReleased(
        bytes32 indexed dealId,
        address indexed operator,
        uint128 operatorAmount,
        uint128 feeAmount
    );

    event DealRefunded(
        bytes32 indexed dealId,
        address indexed advertiser,
        uint128 amount
    );

    event Withdrawn(
        address indexed account,
        address indexed recipient,
        uint128 amount
    );

    event PlatformFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps);

    event FeeVaultUpdated(address oldVault, address newVault);

    event DealCompleted(bytes32 indexed dealId);

    // ============================================
    // Errors
    // ============================================

    error DealAlreadyExists(bytes32 dealId);
    error DealNotFound(bytes32 dealId);
    error DealNotActive(bytes32 dealId);
    error DealNotExpired(bytes32 dealId, uint64 expiresAt);
    error InvalidAmount();
    error InvalidMaxParticipants();
    error InvalidExpiresAt();
    error InsufficientDealBalance(bytes32 dealId, uint128 available, uint128 requested);
    error MaxParticipantsReached(bytes32 dealId, uint32 max);
    error FeeTooHigh(uint16 feeBps, uint16 maxFeeBps);
    error ZeroAddress();
    error NothingToWithdraw();
    error ArrayLengthMismatch();
    error NotAdvertiserOrArbiter(bytes32 dealId);

    // ============================================
    // Advertiser Functions
    // ============================================

    function depositToDeal(
        bytes32 dealId,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt
    ) external;

    function depositToDealWithPermit(
        bytes32 dealId,
        uint128 amount,
        uint32 maxParticipants,
        uint64 expiresAt,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

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
    ) external;

    // ============================================
    // Arbiter Functions
    // ============================================

    function releaseToDeal(
        bytes32 dealId,
        address operator,
        uint128 rewardAmount
    ) external;

    function batchRelease(
        bytes32 dealId,
        address[] calldata operators,
        uint128[] calldata amounts
    ) external;

    function refundDeal(bytes32 dealId) external;

    function completeDeal(bytes32 dealId) external;

    // ============================================
    // Operator Functions
    // ============================================

    function withdraw() external;

    function withdrawTo(address recipient) external;

    // ============================================
    // Admin Functions
    // ============================================

    function setPlatformFee(uint16 feeBps) external;

    function setFeeVault(address vault) external;

    // ============================================
    // View Functions
    // ============================================

    function getDeal(bytes32 dealId) external view returns (DealEscrow memory);

    function getWithdrawableBalance(address account) external view returns (uint256);

    function platformFeeBps() external view returns (uint16);

    function feeVault() external view returns (address);

    function token() external view returns (address);
}
