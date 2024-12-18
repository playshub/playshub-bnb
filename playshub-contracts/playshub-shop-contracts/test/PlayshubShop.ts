import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers, upgrades } from "hardhat";
import { PlayshubShop } from "../typechain-types";

describe("PlayshubShop", function () {
  async function deployPlayshubShopFixture() {
    const [owner, alice] = await hre.ethers.getSigners();
    const Contract = await hre.ethers.getContractFactory("PlayshubShop");
    const contract = (await upgrades.deployProxy(
      Contract,
      [
        owner.address,
        ["Fragment", "Gem"],
        [hre.ethers.parseEther("0.001"), hre.ethers.parseEther("0.001")],
      ],
      {
        initializer: "initialize",
        kind: "uups",
      }
    )) as unknown as PlayshubShop;
    await contract.waitForDeployment();

    return { contract, owner, alice };
  }

  describe("Deployment", function () {
    it("Should initialize correctly", async function () {
      const { contract, owner } = await loadFixture(deployPlayshubShopFixture);

      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.getItem(0)).to.eql([
        0n,
        "Fragment",
        hre.ethers.parseEther("0.001"),
        0n,
      ]);
      expect(await contract.getItem(1)).to.eql([
        1n,
        "Gem",
        hre.ethers.parseEther("0.001"),
        0n,
      ]);
    });
  });

  describe("addItem", function () {
    describe("Validations", function () {
      it("Should revert with the right error if non-owner called", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.connect(alice).addItem("Sword", ethers.parseEther("0.01"))
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });
    });

    describe("Events", function () {
      it("Should emit an event ItemAdded", async function () {
        const { contract, owner } = await loadFixture(
          deployPlayshubShopFixture
        );

        const totalItems = await contract.totalItems();

        await expect(contract.addItem("Sword", ethers.parseEther("0.01")))
          .to.emit(contract, "ItemAdded")
          .withArgs(
            owner.address,
            totalItems,
            "Sword",
            ethers.parseEther("0.01"),
            0n
          );

        expect(await contract.totalItems()).to.equal(totalItems + 1n);
        expect(await contract.getItem(totalItems)).to.eql([
          totalItems,
          "Sword",
          ethers.parseEther("0.01"),
          0n,
        ]);
      });
    });
  });
  describe("purchaseItem", function () {
    describe("Validations", function () {
      it("Should revert with the purchase non-exist item", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        const totalItems = await contract.totalItems();

        await expect(
          contract.connect(alice).purchaseItem(totalItems, "mockPurchaseItem", {
            value: ethers.parseEther("0.01"),
          })
        ).to.be.rejectedWith("InvalidItemId");
      });

      it("Should revert with insufficient balance", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.connect(alice).purchaseItem(0, "mockUserId", {
            value: ethers.parseEther("0.005"),
          })
        ).to.be.rejectedWith("InsufficientBalance");
      });
    });

    describe("Events", function () {
      it("Should emit an event ItemPurchased", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.connect(alice).purchaseItem(0, "mockUserId", {
            value: ethers.parseEther("0.001"),
          })
        )
          .to.emit(contract, "ItemPurchased")
          .withArgs(
            alice.address,
            0,
            "Fragment",
            ethers.parseEther("0.001"),
            "mockUserId"
          );
      });
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if non-owner called", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.connect(alice).withdraw(ethers.parseEther("0.1"))
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { contract, alice, owner } = await loadFixture(
          deployPlayshubShopFixture
        );

        await contract
          .connect(alice)
          .purchaseItem(0, "mockUserId", { value: ethers.parseEther("0.001") });

        await expect(contract.withdraw(ethers.parseEther("0.001")))
          .to.emit(contract, "Withdrawn")
          .withArgs(owner.address, ethers.parseEther("0.001"));
      });
    });

    describe("Success", function () {
      it("Should update balance correctly", async function () {
        const { contract, alice, owner } = await loadFixture(
          deployPlayshubShopFixture
        );

        const initialBalance = await ethers.provider.getBalance(owner.address);

        await contract
          .connect(alice)
          .purchaseItem(0, "mockUserId", { value: ethers.parseEther("0.001") });

        const tx = await contract.withdraw(ethers.parseEther("0.001"));
        const receipt = await tx.wait();
        const gasUsed = receipt?.gasUsed || BigInt(0);
        const gasPrice = receipt?.gasPrice || BigInt(0);
        const gasCost = gasUsed * gasPrice;

        const finalBalance = await ethers.provider.getBalance(owner.address);

        expect(finalBalance - initialBalance + gasCost).to.equal(
          ethers.parseEther("0.001")
        );
      });
    });
  });
});
