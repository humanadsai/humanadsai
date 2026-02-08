import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HumanAdsEscrow, MockHUSD } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HumanAdsEscrow — Security", function () {
  let escrow: HumanAdsEscrow;
  let husd: MockHUSD;
  let admin: SignerWithAddress;
  let arbiter: SignerWithAddress;
  let advertiser: SignerWithAddress;
  let operator1: SignerWithAddress;
  let attacker: SignerWithAddress;
  let feeVault: SignerWithAddress;

  const DEAL_ID = ethers.id("security-deal-001");
  const AMOUNT = 1_000_000_000n; // 1,000 hUSD
  const REWARD = 100_000_000n; // 100 hUSD
  const MAX_PARTICIPANTS = 10;
  const FEE_BPS = 1000;

  async function getExpiresAt(offsetSeconds: number = 86400): Promise<bigint> {
    const now = await time.latest();
    return BigInt(now + offsetSeconds);
  }

  beforeEach(async function () {
    [admin, arbiter, advertiser, operator1, attacker, feeVault] =
      await ethers.getSigners();

    const MockHUSD = await ethers.getContractFactory("MockHUSD");
    husd = (await MockHUSD.deploy()) as MockHUSD;

    const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
    escrow = (await upgrades.deployProxy(
      HumanAdsEscrow,
      [
        await husd.getAddress(),
        feeVault.address,
        FEE_BPS,
        admin.address,
        arbiter.address,
      ],
      { kind: "uups" }
    )) as unknown as HumanAdsEscrow;

    await husd.mint(advertiser.address, AMOUNT * 10n);
    await husd
      .connect(advertiser)
      .approve(await escrow.getAddress(), AMOUNT * 10n);
  });

  // ============================================
  // Access Control
  // ============================================

  describe("Access Control", function () {
    it("should prevent attacker from releasing funds", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await expect(
        escrow
          .connect(attacker)
          .releaseToDeal(DEAL_ID, attacker.address, REWARD)
      ).to.be.reverted;
    });

    it("should prevent attacker from batch releasing", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await expect(
        escrow
          .connect(attacker)
          .batchRelease(DEAL_ID, [attacker.address], [REWARD])
      ).to.be.reverted;
    });

    it("should prevent attacker from pausing", async function () {
      await expect(escrow.connect(attacker).pause()).to.be.reverted;
    });

    it("should prevent attacker from setting fee", async function () {
      await expect(escrow.connect(attacker).setPlatformFee(2000)).to.be
        .reverted;
    });

    it("should prevent attacker from setting fee vault", async function () {
      await expect(escrow.connect(attacker).setFeeVault(attacker.address)).to.be
        .reverted;
    });

    it("should prevent attacker from completing deals", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await expect(escrow.connect(attacker).completeDeal(DEAL_ID)).to.be
        .reverted;
    });

    it("should prevent arbiter from admin functions", async function () {
      await expect(escrow.connect(arbiter).setPlatformFee(500)).to.be.reverted;
      await expect(escrow.connect(arbiter).setFeeVault(arbiter.address)).to.be
        .reverted;
      await expect(escrow.connect(arbiter).pause()).to.be.reverted;
    });
  });

  // ============================================
  // Double-spend Prevention
  // ============================================

  describe("Double-spend Prevention", function () {
    it("should not allow double refund", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow.connect(arbiter).refundDeal(DEAL_ID);

      await expect(
        escrow.connect(arbiter).refundDeal(DEAL_ID)
      ).to.be.revertedWithCustomError(escrow, "DealNotActive");
    });

    it("should not allow release after refund", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow.connect(arbiter).refundDeal(DEAL_ID);

      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(DEAL_ID, operator1.address, REWARD)
      ).to.be.revertedWithCustomError(escrow, "DealNotActive");
    });

    it("should not allow release after completion", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow.connect(arbiter).completeDeal(DEAL_ID);

      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(DEAL_ID, operator1.address, REWARD)
      ).to.be.revertedWithCustomError(escrow, "DealNotActive");
    });

    it("should not allow double withdraw", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      await escrow.connect(operator1).withdraw();

      await expect(
        escrow.connect(operator1).withdraw()
      ).to.be.revertedWithCustomError(escrow, "NothingToWithdraw");
    });

    it("should not allow releasing more than deposited total", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      // Release most of the deal
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, AMOUNT - 1n);

      // Trying to release more than remaining
      await expect(
        escrow.connect(arbiter).releaseToDeal(DEAL_ID, operator1.address, 2n)
      ).to.be.revertedWithCustomError(escrow, "InsufficientDealBalance");
    });
  });

  // ============================================
  // Fee Manipulation
  // ============================================

  describe("Fee Manipulation", function () {
    it("should enforce fee cap at initialization", async function () {
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      await expect(
        upgrades.deployProxy(
          HumanAdsEscrow,
          [
            await husd.getAddress(),
            feeVault.address,
            2001, // Over 20%
            admin.address,
            arbiter.address,
          ],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(escrow, "FeeTooHigh");
    });

    it("should enforce fee cap on update", async function () {
      await expect(
        escrow.connect(admin).setPlatformFee(2001)
      ).to.be.revertedWithCustomError(escrow, "FeeTooHigh");
    });

    it("should allow maximum fee of 20%", async function () {
      await escrow.connect(admin).setPlatformFee(2000);
      expect(await escrow.platformFeeBps()).to.equal(2000);
    });

    it("should allow zero fee", async function () {
      await escrow.connect(admin).setPlatformFee(0);
      expect(await escrow.platformFeeBps()).to.equal(0);

      // Release with zero fee
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      // All goes to operator
      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(
        REWARD
      );
      expect(await escrow.getWithdrawableBalance(feeVault.address)).to.equal(0);
    });
  });

  // ============================================
  // Expiry Logic
  // ============================================

  describe("Expiry Logic", function () {
    it("should prevent advertiser from early self-refund", async function () {
      const expiresAt = await getExpiresAt(86400); // 1 day
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await expect(
        escrow.connect(advertiser).refundDeal(DEAL_ID)
      ).to.be.revertedWithCustomError(escrow, "DealNotExpired");
    });

    it("should allow advertiser refund exactly at expiry + 1", async function () {
      const expiresAt = await getExpiresAt(100);
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await time.increaseTo(expiresAt);

      // At exact expiry timestamp should still revert (block.timestamp < expiresAt is false, but not >)
      // Actually block.timestamp >= expiresAt means it should work
      await escrow.connect(advertiser).refundDeal(DEAL_ID);

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.status).to.equal(2); // Cancelled
    });
  });

  // ============================================
  // Initialization Safety
  // ============================================

  describe("Initialization Safety", function () {
    it("should reject zero token address", async function () {
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      await expect(
        upgrades.deployProxy(
          HumanAdsEscrow,
          [
            ethers.ZeroAddress,
            feeVault.address,
            FEE_BPS,
            admin.address,
            arbiter.address,
          ],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should reject zero admin address", async function () {
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      await expect(
        upgrades.deployProxy(
          HumanAdsEscrow,
          [
            await husd.getAddress(),
            feeVault.address,
            FEE_BPS,
            ethers.ZeroAddress,
            arbiter.address,
          ],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should reject zero arbiter address", async function () {
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      await expect(
        upgrades.deployProxy(
          HumanAdsEscrow,
          [
            await husd.getAddress(),
            feeVault.address,
            FEE_BPS,
            admin.address,
            ethers.ZeroAddress,
          ],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should reject zero fee vault address", async function () {
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      await expect(
        upgrades.deployProxy(
          HumanAdsEscrow,
          [
            await husd.getAddress(),
            ethers.ZeroAddress,
            FEE_BPS,
            admin.address,
            arbiter.address,
          ],
          { kind: "uups" }
        )
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe("Edge Cases", function () {
    it("should handle uint128 max deposit", async function () {
      const maxUint128 = 2n ** 128n - 1n;
      await husd.mint(advertiser.address, maxUint128);
      await husd
        .connect(advertiser)
        .approve(await escrow.getAddress(), maxUint128);

      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, maxUint128, MAX_PARTICIPANTS, expiresAt);

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.totalDeposited).to.equal(maxUint128);
    });

    it("should handle minimum deposit (1 wei)", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, 1n, MAX_PARTICIPANTS, expiresAt);

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.totalDeposited).to.equal(1n);
    });

    it("should handle multiple deals from same advertiser", async function () {
      const expiresAt = await getExpiresAt();
      const dealId2 = ethers.id("deal-002");

      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(advertiser)
        .depositToDeal(dealId2, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      const deal1 = await escrow.getDeal(DEAL_ID);
      const deal2 = await escrow.getDeal(dealId2);
      expect(deal1.totalDeposited).to.equal(AMOUNT);
      expect(deal2.totalDeposited).to.equal(AMOUNT);
    });

    it("should accumulate operator balance across multiple deals", async function () {
      const expiresAt = await getExpiresAt();
      const dealId2 = ethers.id("deal-002");

      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(advertiser)
        .depositToDeal(dealId2, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);
      await escrow
        .connect(arbiter)
        .releaseToDeal(dealId2, operator1.address, REWARD);

      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = (REWARD - feeExpected) * 2n;

      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(
        operatorExpected
      );

      // Single withdraw gets both
      await escrow.connect(operator1).withdraw();
      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(0);
    });
  });
});
