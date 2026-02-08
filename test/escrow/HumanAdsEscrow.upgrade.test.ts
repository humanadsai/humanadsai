import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HumanAdsEscrow, MockHUSD } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HumanAdsEscrow — Upgrade", function () {
  let escrow: HumanAdsEscrow;
  let husd: MockHUSD;
  let admin: SignerWithAddress;
  let arbiter: SignerWithAddress;
  let advertiser: SignerWithAddress;
  let operator1: SignerWithAddress;
  let feeVault: SignerWithAddress;

  const DEAL_ID = ethers.id("upgrade-deal-001");
  const AMOUNT = 1_000_000_000n;
  const REWARD = 100_000_000n;
  const MAX_PARTICIPANTS = 10;
  const FEE_BPS = 1000;

  async function getExpiresAt(offsetSeconds: number = 86400): Promise<bigint> {
    const now = await time.latest();
    return BigInt(now + offsetSeconds);
  }

  beforeEach(async function () {
    [admin, arbiter, advertiser, operator1, feeVault] =
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

  describe("UUPS Upgrade", function () {
    it("should preserve storage after upgrade", async function () {
      // Create deal and release before upgrade
      const expiresAt = await getExpiresAt();
      await escrow
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);
      await escrow
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      const feeExpected = (REWARD * BigInt(FEE_BPS)) / 10000n;
      const operatorExpected = REWARD - feeExpected;

      // Record state before upgrade
      const dealBefore = await escrow.getDeal(DEAL_ID);
      const balanceBefore = await escrow.getWithdrawableBalance(
        operator1.address
      );
      const feeBpsBefore = await escrow.platformFeeBps();
      const feeVaultBefore = await escrow.feeVault();

      // Upgrade to same implementation (simulates V2)
      const HumanAdsEscrowV2 =
        await ethers.getContractFactory("HumanAdsEscrow");
      const upgraded = (await upgrades.upgradeProxy(
        await escrow.getAddress(),
        HumanAdsEscrowV2,
        { kind: "uups" }
      )) as unknown as HumanAdsEscrow;

      // Verify state preserved
      const dealAfter = await upgraded.getDeal(DEAL_ID);
      expect(dealAfter.advertiser).to.equal(dealBefore.advertiser);
      expect(dealAfter.totalDeposited).to.equal(dealBefore.totalDeposited);
      expect(dealAfter.totalReleased).to.equal(dealBefore.totalReleased);
      expect(dealAfter.status).to.equal(dealBefore.status);

      expect(await upgraded.getWithdrawableBalance(operator1.address)).to.equal(
        balanceBefore
      );
      expect(await upgraded.platformFeeBps()).to.equal(feeBpsBefore);
      expect(await upgraded.feeVault()).to.equal(feeVaultBefore);

      // Functions still work after upgrade
      await upgraded.connect(operator1).withdraw();
      expect(
        await upgraded.getWithdrawableBalance(operator1.address)
      ).to.equal(0);
    });

    it("should only allow admin to upgrade", async function () {
      const HumanAdsEscrowV2 =
        await ethers.getContractFactory("HumanAdsEscrow");

      // Non-admin should fail
      const HumanAdsEscrowNonAdmin = await ethers.getContractFactory(
        "HumanAdsEscrow",
        arbiter
      );
      await expect(
        upgrades.upgradeProxy(
          await escrow.getAddress(),
          HumanAdsEscrowNonAdmin,
          { kind: "uups" }
        )
      ).to.be.reverted;
    });

    it("should not allow direct implementation initialization", async function () {
      // Deploy implementation directly
      const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
      const impl = await HumanAdsEscrow.deploy();

      // Attempt to initialize the implementation directly should fail
      await expect(
        impl.initialize(
          await husd.getAddress(),
          feeVault.address,
          FEE_BPS,
          admin.address,
          arbiter.address
        )
      ).to.be.reverted;
    });

    it("should maintain proxy address after upgrade", async function () {
      const proxyAddress = await escrow.getAddress();

      const HumanAdsEscrowV2 =
        await ethers.getContractFactory("HumanAdsEscrow");
      const upgraded = await upgrades.upgradeProxy(
        proxyAddress,
        HumanAdsEscrowV2,
        { kind: "uups" }
      );

      expect(await upgraded.getAddress()).to.equal(proxyAddress);
    });

    it("should have a valid implementation address after upgrade", async function () {
      const proxyAddress = await escrow.getAddress();

      const HumanAdsEscrowV2 =
        await ethers.getContractFactory("HumanAdsEscrow");
      await upgrades.upgradeProxy(proxyAddress, HumanAdsEscrowV2, {
        kind: "uups",
      });

      const implAfter =
        await upgrades.erc1967.getImplementationAddress(proxyAddress);
      // Implementation address should be a valid non-zero address
      expect(implAfter).to.not.equal(ethers.ZeroAddress);
      // And different from the proxy itself
      expect(implAfter).to.not.equal(proxyAddress);
    });

    it("should allow operations after upgrade (full lifecycle)", async function () {
      // Upgrade first
      const HumanAdsEscrowV2 =
        await ethers.getContractFactory("HumanAdsEscrow");
      const upgraded = (await upgrades.upgradeProxy(
        await escrow.getAddress(),
        HumanAdsEscrowV2,
        { kind: "uups" }
      )) as unknown as HumanAdsEscrow;

      // Full lifecycle after upgrade
      const expiresAt = await getExpiresAt();
      await upgraded
        .connect(advertiser)
        .depositToDeal(DEAL_ID, AMOUNT, MAX_PARTICIPANTS, expiresAt);

      await upgraded
        .connect(arbiter)
        .releaseToDeal(DEAL_ID, operator1.address, REWARD);

      await upgraded.connect(operator1).withdraw();

      await upgraded.connect(arbiter).completeDeal(DEAL_ID);

      const deal = await upgraded.getDeal(DEAL_ID);
      expect(deal.status).to.equal(1); // Completed
    });
  });
});
