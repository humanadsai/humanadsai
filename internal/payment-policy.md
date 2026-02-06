# Payment Policy

**INTERNAL — NOT FOR PUBLIC DISTRIBUTION**

**Effective Date:** 2025-02-06
**Last Updated:** 2025-02-06

---

## 1. Payment Model — A-Plan (Address Unlock Fee + Delayed Payout)

Payments follow a two-stage process:

### Stage 1: Address Unlock Fee (AUF)

- The operator pays a small upfront fee (default 10%, configurable per deal) to verify their wallet address.
- This confirms the operator has access to a valid wallet and can receive on-chain payments.
- The AUF percentage is set at deal creation time and recorded on the deal record.

### Stage 2: Main Payout

- The remaining amount (default 90%) is released after the AUF is confirmed on-chain.
- Payout is triggered after the mission is verified and approved by a reviewer or admin.

## 2. Payout Modes

### Ledger (Simulated)

- No real blockchain transactions are executed.
- Transaction hashes are prefixed with `SIMULATED_` to distinguish them from real transactions.
- Used for development, testing, and demonstration purposes.
- Ledger entries are recorded in the database for auditability.

### Onchain (Real)

- Actual blockchain transactions are submitted and confirmed on-chain.
- Real gas fees are consumed from the treasury wallet.
- Transaction hashes correspond to verifiable on-chain transactions.

## 3. Current Configuration (TEST)

| Parameter | Value |
|-----------|-------|
| **Network** | Sepolia (Ethereum testnet) |
| **Token** | hUSD (HumanAds USD Test Token) |
| **Decimals** | 6 |
| **Treasury Address** | `0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017` |
| **Fee Recipient** | `0x5acd3371DB99f7D17DFaFD14b522148260862DE8` |
| **Conversion Rate** | 1 cent = 10,000 hUSD base units |
| **Verification Mode** | RELAXED (1 confirmation) |
| **Gas Limit** | 100,000 |

## 4. Production Configuration (PLANNED)

| Parameter | Value |
|-----------|-------|
| **Network** | Base/USDC or Ethereum/USDC (TBD) |
| **Verification Mode** | STRICT (12 confirmations) |
| **Treasury Addresses** | TBD |
| **Fee Structure** | TBD |

Production configuration will be finalized and documented before mainnet launch.

## 5. Payment Conditions

All of the following must be true before a payment is executed:

- The mission has been **verified and approved** by a reviewer or admin
- The operator has a **valid wallet address** on file
- The treasury has **sufficient token balance** to cover the payment
- The treasury **private key** is configured in the environment

If any condition is not met, the payment will not proceed and an appropriate error is returned.

## 6. Failure Handling

| Failure | Response |
|---------|----------|
| **RPC failure** | Automatic retry (1 retry). If retry fails, error returned and admin notified. |
| **Insufficient treasury balance** | Error returned immediately. Admin notified to top up treasury. |
| **Invalid recipient address** | Payment rejected. Operator notified to update wallet address. |
| **Gas estimation failure** | Fallback to hardcoded gas limit of 100,000. If transaction still fails, error returned. |

## 7. Clawback Conditions

Clawback (reclaiming previously paid tokens) may be initiated when:

- The operator **deletes the post** after receiving payment
- **Fraud is discovered** after payment has been disbursed
- **Mission conditions were not actually met** (discovered in post-review)
- The operator accumulates **repeat violations** (see Moderation Playbook)

Clawback is executed as a separate on-chain transaction or ledger adjustment. The decision to initiate clawback is made by an admin.

## 8. Faucet (Test Mode)

The hUSD faucet is available in test mode only:

| Parameter | Value |
|-----------|-------|
| **Access** | Admin-only operation |
| **Default Amount** | $1,000 (100,000 cents / 1,000,000,000 base units) |
| **Cooldown** | 24 hours per wallet address |
| **Balance Check** | Treasury balance verified before dispensing |
| **Logging** | All faucet operations recorded in `token_ops` table |

## 9. Refund Policy

- **On-chain transactions** are generally **non-refundable** once confirmed on the blockchain. Refunds require a new outbound transaction from the recipient, which HumanAds cannot force.
- **Ledger mode entries** can be manually adjusted by an admin if a refund is warranted.
- Refund requests are handled on a case-by-case basis through support@humanadsai.com.

## 10. Fee Structure

- **AUF percentage**: Configurable per deal. Default is 10% of the total mission payout.
- **Platform fees**: TBD. Fee structure for production will be defined and communicated before mainnet launch.
- All fees are transparently recorded in the deal and payment records.
