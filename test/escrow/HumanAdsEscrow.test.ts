import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HumanAdsEscrow, MockHUSD } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HumanAdsEscrow", function () {
  let escrow: HumanAdsEscrow;
  let husd: MockHUSD;
  let admin: SignerWithAddress;
  let arbiter: SignerWithAddress;
  let advertiser: SignerWithAddress;
  let operator1: SignerWithAddress;
  let operator2: SignerWithAddress;
  let feeVault: SignerWithAddress;

  const DEAL_ID = ethers.id("deal-001");
  const AMOUNT = 1_000_000_000n; // 1,000 hUSD (6 decimals)
  const REWARD = 100_000_000n; // 100 hUSD
  const MAX_PARTICIPANTS = 10;
  const FEE_BPS = 1000; // 10%

  async function getExpiresAt(offsetSeconds: number = 86400): Promise<bigint> {
    const now = await time.latest();
    return BigInt(now + offsetSeconds);
  }

  beforeEach(async function () {
    [admin, arbiter, advertiser, operator1, operator2, feeVault] =
      await ethers.getSigners();

    // Deploy MockHUSD
    const MockHUSD = await ethers.getContractFactory("MockHUSD");
    husd = (await MockHUSD.deploy()) as MockHUSD;

    // Deploy HumanAdsEscrow via UUPS proxy
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

    // Mint hUSD to advertiser and approve escrow
    await husd.mint(advertiser.address, AMOUNT * 10n);
    await husd
      .connect(advertiser)
      .approve(await escrow.getAddress(), AMOUNT * 10n);
  });

  // ============================================
  // Initialization
  // ============================================

  describe("Initialization", function () {
    it("should set token address", async function () {
      expect(await escrow.token()).to.equal(await husd.getAddress());
    });

    it("should set fee vault", async function () {
      expect(await escrow.feeVault()).to.equal(feeVault.address);
    });

    it("should set platform fee", async function () {
      expect(await escrow.platformFeeBps()).to.equal(FEE_BPS);
    });

    it("should grant admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await escrow.DEFAULT_ADMIN_ROLE();
      expect(await escrow.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be
        .true;
    });

    it("should grant arbiter role", async function () {
      const ARBITER_ROLE = await escrow.ARBITER_ROLE();
      expect(await escrow.hasRole(ARBITER_ROLE, arbiter.address)).to.be.true;
    });

    it("should not allow re-initialization", async function () {
      await expect(
        escrow.initialize(
          await husd.getAddress(),
          feeVault.address,
          FEE_BPS,
          admin.address,
          arbiter.address
        )
      ).to.be.reverted;
    });
  });

  // ============================================
  // Deposit
  // ============================================

  describe("depositToDeal", function () {
    it("should create deal and transfer tokens", async function () {
      const expiresAt = await getExpiresAt();

      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt)
      )
        .to.emit(escrow, "DealDeposited")
        .withArgs(
          DEAL_ID,
          advertiser.address,
          AMOUNT,
          MAX_PARTICIPANTS,
          expiresAt
        );

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.advertiser).to.equal(advertiser.address);
      expect(deal.totalDeposited).to.equal(AMOUNT);
      expect(deal.status).to.equal(0); // Active

      // Tokens transferred
      expect(await husd.balanceOf(await escrow.getAddress())).to.equal(AMOUNT);
    });

    it("should reject duplicate deal ID", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt)
      ).to.be.revertedWithCustomError(escrow, "DealAlreadyExists");
    });

    it("should reject zero amount", async function () {
      const expiresAt = await getExpiresAt();
      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, 0, MAX_PARTICIPANTS, expiresAt)
      ).to.be.revertedWithCustomError(escrow, "InvalidAmount");
    });

    it("should reject zero maxParticipants", async function () {
      const expiresAt = await getExpiresAt();
      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, AMOUNT, 0, expiresAt)
      ).to.be.revertedWithCustomError(escrow, "InvalidMaxParticipants");
    });

    it("should reject past expiresAt", async function () {
      const now = await time.latest();
      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, now)
      ).to.be.revertedWithCustomError(escrow, "InvalidExpiresAt");
    });
  });

  // ============================================
  // Release
  // ============================================

  describe("releaseToDeal", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
    });

    it("should release with correct fee split (10% fee, 90% operator)", async function () {
      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = REWARD - feeExpected;

      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(DEAL_ID, operator1.address, REWARD)
      )
        .to.emit(escrow, "FundsReleased")
        .withArgs(DEAL_ID, operator1.address, operatorExpected, feeExpected);

      // Operator balance credited
      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(
        operatorExpected
      );

      // Fee vault balance credited
      expect(await escrow.getWithdrawableBalance(feeVault.address)).to.equal(
        feeExpected
      );

      // Deal updated
      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.totalReleased).to.equal(REWARD);
      expect(deal.currentReleased).to.equal(1);
    });

    it("should reject release by non-arbiter", async function () {
      await expect(
        escrow
          .connect(advertiser)
          .releaseToDeal(DEAL_ID, operator1.address, REWARD)
      ).to.be.reverted;
    });

    it("should reject release for non-existent deal", async function () {
      const fakeDeal = ethers.id("fake-deal");
      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(fakeDeal, operator1.address, REWARD)
      ).to.be.revertedWithCustomError(escrow, "DealNotFound");
    });

    it("should reject release exceeding deal balance", async function () {
      const tooMuch = AMOUNT + 1n;
      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(DEAL_ID, operator1.address, tooMuch)
      ).to.be.revertedWithCustomError(escrow, "InsufficientDealBalance");
    });

    it("should reject release to zero address", async function () {
      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(DEAL_ID, ethers.ZeroAddress, REWARD)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should reject release with zero amount", async function () {
      await expect(
        escrow.connect(arbiter).releaseToDeal(DEAL_ID, operator1.address, 0)
      ).to.be.revertedWithCustomError(escrow, "InvalidAmount");
    });

    it("should respect maxParticipants limit", async function () {
      // Create deal with maxParticipants = 1
      const dealId2 = ethers.id("deal-002");
      await escrow
        .connect(advertiser)
        .depositToDeal(dealId2, AMOUNT, 1, expiresAt);

      // First release should succeed
      await escrow
        .connect(arbiter)
        .releaseToDeal(dealId2, operator1.address, REWARD);

      // Second release should fail
      await expect(
        escrow
          .connect(arbiter)
          .releaseToDeal(dealId2, operator2.address, REWARD)
      ).to.be.revertedWithCustomError(escrow, "MaxParticipantsReached");
    });
  });

  // ============================================
  // Batch Release
  // ============================================

  describe("batchRelease", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
    });

    it("should release to multiple operators", async function () {
      await escrow
        .connect(arbiter)
        .batchRelease(
          DEAL_ID,
          [operator1.address, operator2.address],
          [REWARD, REWARD]
        );

      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = REWARD - feeExpected;

      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(
        operatorExpected
      );
      expect(await escrow.getWithdrawableBalance(operator2.address)).to.equal(
        operatorExpected
      );

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.currentReleased).to.equal(2);
      expect(deal.totalReleased).to.equal(REWARD * 2n);
    });

    it("should reject mismatched array lengths", async function () {
      await expect(
        escrow
          .connect(arbiter)
          .batchRelease(
            DEAL_ID,
            [operator1.address, operator2.address],
            [REWARD]
          )
      ).to.be.revertedWithCustomError(escrow, "ArrayLengthMismatch");
    });
  });

  // ============================================
  // Refund
  // ============================================

  describe("refundDeal", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
    });

    it("should allow arbiter to refund anytime", async function () {
      await expect(escrow.connect(arbiter).refundDeal(DEAL_ID))
        .to.emit(escrow, "DealRefunded")
        .withArgs(DEAL_ID, advertiser.address, AMOUNT);

      expect(await husd.balanceOf(advertiser.address)).to.equal(AMOUNT * 10n); // original balance restored
      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.status).to.equal(2); // Cancelled
    });

    it("should refund remaining after partial release", async function () {
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      const remaining = AMOUNT - REWARD;
      await expect(escrow.connect(arbiter).refundDeal(DEAL_ID))
        .to.emit(escrow, "DealRefunded")
        .withArgs(DEAL_ID, advertiser.address, remaining);
    });

    it("should reject advertiser refund before expiry", async function () {
      await expect(
        escrow.connect(advertiser).refundDeal(DEAL_ID)
      ).to.be.revertedWithCustomError(escrow, "DealNotExpired");
    });

    it("should allow advertiser refund after expiry", async function () {
      await time.increaseTo(expiresAt + 1n);

      await expect(escrow.connect(advertiser).refundDeal(DEAL_ID))
        .to.emit(escrow, "DealRefunded")
        .withArgs(DEAL_ID, advertiser.address, AMOUNT);
    });

    it("should reject refund by random user", async function () {
      await expect(
        escrow.connect(operator1).refundDeal(DEAL_ID)
      ).to.be.revertedWithCustomError(escrow, "NotAdvertiserOrArbiter");
    });

    it("should reject refund on already cancelled deal", async function () {
      await escrow.connect(arbiter).refundDeal(DEAL_ID);
      await expect(
        escrow.connect(arbiter).refundDeal(DEAL_ID)
      ).to.be.revertedWithCustomError(escrow, "DealNotActive");
    });
  });

  // ============================================
  // Complete Deal
  // ============================================

  describe("completeDeal", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
    });

    it("should complete deal and refund remaining", async function () {
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      const remaining = AMOUNT - REWARD;

      await expect(escrow.connect(arbiter).completeDeal(DEAL_ID))
        .to.emit(escrow, "DealCompleted")
        .withArgs(DEAL_ID)
        .and.to.emit(escrow, "DealRefunded")
        .withArgs(DEAL_ID, advertiser.address, remaining);

      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.status).to.equal(1); // Completed
    });

    it("should reject completion by non-arbiter", async function () {
      await expect(escrow.connect(advertiser).completeDeal(DEAL_ID)).to.be
        .reverted;
    });
  });

  // ============================================
  // Withdraw
  // ============================================

  describe("withdraw", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);
    });

    it("should withdraw accumulated balance", async function () {
      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = REWARD - feeExpected;
      const balBefore = await husd.balanceOf(operator1.address);

      await expect(escrow.connect(operator1).withdraw())
        .to.emit(escrow, "Withdrawn")
        .withArgs(operator1.address, operator1.address, operatorExpected);

      const balAfter = await husd.balanceOf(operator1.address);
      expect(balAfter - balBefore).to.equal(operatorExpected);
      expect(await escrow.getWithdrawableBalance(operator1.address)).to.equal(
        0
      );
    });

    it("should reject withdraw with zero balance", async function () {
      await expect(
        escrow.connect(operator2).withdraw()
      ).to.be.revertedWithCustomError(escrow, "NothingToWithdraw");
    });

    it("should allow fee vault to withdraw fees", async function () {
      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;

      await expect(escrow.connect(feeVault).withdraw())
        .to.emit(escrow, "Withdrawn")
        .withArgs(feeVault.address, feeVault.address, feeExpected);
    });
  });

  // ============================================
  // WithdrawTo
  // ============================================

  describe("withdrawTo", function () {
    let expiresAt: bigint;

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);
    });

    it("should withdraw to a different address", async function () {
      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = REWARD - feeExpected;
      const balBefore = await husd.balanceOf(operator2.address);

      await escrow.connect(operator1).withdrawTo(operator2.address);

      const balAfter = await husd.balanceOf(operator2.address);
      expect(balAfter - balBefore).to.equal(operatorExpected);
    });

    it("should reject withdrawTo zero address", async function () {
      await expect(
        escrow.connect(operator1).withdrawTo(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });
  });

  // ============================================
  // depositOnBehalfWithPermit
  // ============================================

  describe("depositOnBehalfWithPermit", function () {
    let expiresAt: bigint;

    // Helper to create EIP-2612 permit signature
    async function signPermit(
      signer: SignerWithAddress,
      spender: string,
      value: bigint,
      deadline: bigint
    ) {
      const husdAddress = await husd.getAddress();
      const nonce = await husd.nonces(signer.address);

      const domain = {
        name: "Mock hUSD",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: husdAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      };

      const signature = await signer.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);
      return { v, r, s, deadline };
    }

    beforeEach(async function () {
      expiresAt = await getExpiresAt();
      // Mint hUSD to advertiser (no pre-approval needed — permit handles it)
      // advertiser already has tokens from top-level beforeEach
    });

    it("should allow arbiter to deposit on behalf with valid permit", async function () {
      const escrowAddress = await escrow.getAddress();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const { v, r, s } = await signPermit(advertiser, escrowAddress, AMOUNT, deadline);

      await expect(
        escrow
          .connect(arbiter)
          .depositOnBehalfWithPermit(
            DEAL_ID, advertiser.address, AMOUNT,
            MAX_PARTICIPANTS, expiresAt,
            deadline, v, r, s
          )
      )
        .to.emit(escrow, "DealDeposited")
        .withArgs(DEAL_ID, advertiser.address, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      // Verify deal records advertiser address (not arbiter/treasury)
      const deal = await escrow.getDeal(DEAL_ID);
      expect(deal.advertiser).to.equal(advertiser.address);
      expect(deal.totalDeposited).to.equal(AMOUNT);
      expect(deal.status).to.equal(0); // Active
    });

    it("should decrease advertiser's hUSD and increase escrow balance", async function () {
      const escrowAddress = await escrow.getAddress();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const { v, r, s } = await signPermit(advertiser, escrowAddress, AMOUNT, deadline);

      const advertiserBalBefore = await husd.balanceOf(advertiser.address);
      const escrowBalBefore = await husd.balanceOf(escrowAddress);

      await escrow
        .connect(arbiter)
        .depositOnBehalfWithPermit(
          DEAL_ID, advertiser.address, AMOUNT,
          MAX_PARTICIPANTS, expiresAt,
          deadline, v, r, s
        );

      const advertiserBalAfter = await husd.balanceOf(advertiser.address);
      const escrowBalAfter = await husd.balanceOf(escrowAddress);

      expect(advertiserBalBefore - advertiserBalAfter).to.equal(AMOUNT);
      expect(escrowBalAfter - escrowBalBefore).to.equal(AMOUNT);
    });

    it("should revert when called by non-arbiter", async function () {
      const escrowAddress = await escrow.getAddress();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const { v, r, s } = await signPermit(advertiser, escrowAddress, AMOUNT, deadline);

      await expect(
        escrow
          .connect(advertiser)
          .depositOnBehalfWithPermit(
            DEAL_ID, advertiser.address, AMOUNT,
            MAX_PARTICIPANTS, expiresAt,
            deadline, v, r, s
          )
      ).to.be.reverted;
    });

    it("should revert for zero advertiser address", async function () {
      const escrowAddress = await escrow.getAddress();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const { v, r, s } = await signPermit(advertiser, escrowAddress, AMOUNT, deadline);

      await expect(
        escrow
          .connect(arbiter)
          .depositOnBehalfWithPermit(
            DEAL_ID, ethers.ZeroAddress, AMOUNT,
            MAX_PARTICIPANTS, expiresAt,
            deadline, v, r, s
          )
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should record advertiser (not treasury) so refund goes back to advertiser", async function () {
      const escrowAddress = await escrow.getAddress();
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const { v, r, s } = await signPermit(advertiser, escrowAddress, AMOUNT, deadline);

      await escrow
        .connect(arbiter)
        .depositOnBehalfWithPermit(
          DEAL_ID, advertiser.address, AMOUNT,
          MAX_PARTICIPANTS, expiresAt,
          deadline, v, r, s
        );

      // Refund should go to advertiser
      const advertiserBalBefore = await husd.balanceOf(advertiser.address);

      await expect(escrow.connect(arbiter).refundDeal(DEAL_ID))
        .to.emit(escrow, "DealRefunded")
        .withArgs(DEAL_ID, advertiser.address, AMOUNT);

      const advertiserBalAfter = await husd.balanceOf(advertiser.address);
      expect(advertiserBalAfter - advertiserBalBefore).to.equal(AMOUNT);
    });
  });

  // ============================================
  // Admin: Fee & Vault
  // ============================================

  describe("Admin functions", function () {
    it("should update platform fee", async function () {
      await expect(escrow.connect(admin).setPlatformFee(500))
        .to.emit(escrow, "PlatformFeeUpdated")
        .withArgs(FEE_BPS, 500);

      expect(await escrow.platformFeeBps()).to.equal(500);
    });

    it("should reject fee above max", async function () {
      await expect(
        escrow.connect(admin).setPlatformFee(2001)
      ).to.be.revertedWithCustomError(escrow, "FeeTooHigh");
    });

    it("should update fee vault", async function () {
      await expect(escrow.connect(admin).setFeeVault(operator1.address))
        .to.emit(escrow, "FeeVaultUpdated")
        .withArgs(feeVault.address, operator1.address);
    });

    it("should reject fee vault zero address", async function () {
      await expect(
        escrow.connect(admin).setFeeVault(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(escrow, "ZeroAddress");
    });

    it("should reject non-admin fee update", async function () {
      await expect(escrow.connect(arbiter).setPlatformFee(500)).to.be.reverted;
    });

    it("should allow pause/unpause", async function () {
      await escrow.connect(admin).pause();

      const expiresAt = await getExpiresAt();
      await expect(
        escrow
          .connect(advertiser)
          .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt)
      ).to.be.reverted;

      await escrow.connect(admin).unpause();

      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
    });

    it("should allow withdraw even when paused", async function () {
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      await escrow.connect(admin).pause();

      // Withdraw should still work
      await expect(escrow.connect(operator1).withdraw()).to.not.be.reverted;
    });
  });
});
