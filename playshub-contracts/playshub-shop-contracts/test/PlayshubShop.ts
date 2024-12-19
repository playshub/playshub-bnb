import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

describe("PlayshubShop", function () {
  async function deployPlayshubShopFixture() {
    const [owner, alice] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const contract = await hre.viem.deployContract("PlayshubShop", [
      owner.account.address,
      [1n, 2n],
      ["Fragment", "Gem"],
      [parseEther("0.001"), parseEther("0.001")],
    ]);
    return {
      contract,
      owner,
      alice,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should initialize correctly", async function () {
      const { contract, owner } = await loadFixture(deployPlayshubShopFixture);

      expect((await contract.read.owner()).toLowerCase()).to.equal(
        owner.account.address
      );
      expect(await contract.read.getItem([1n])).to.eql({
        id: 1n,
        name: "Fragment",
        price: parseEther("0.001"),
        status: 1,
      });

      expect(await contract.read.getItem([2n])).to.eql({
        id: 2n,
        name: "Gem",
        price: parseEther("0.001"),
        status: 1,
      });
    });
  });

  describe("addItem", function () {
    describe("Validations", function () {
      it("Should revert with the right error if non-owner called", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.write.addItem([2n, "Sword", parseEther("0.01")], {
            account: alice.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });

      it("Should revert when item exist", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.write.addItem([1n, "Sword", parseEther("0.01")])
        ).to.be.rejectedWith("ItemAlreadyExist");
      });
    });

    describe("Events", function () {
      it("Should emit an event ItemAdded", async function () {
        const { contract, owner, publicClient } = await loadFixture(
          deployPlayshubShopFixture
        );

        const hash = await contract.write.addItem([
          3n,
          "Sword",
          parseEther("0.01"),
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await contract.getEvents.ItemAdded();

        expect(events).to.have.lengthOf(1);
        expect(events[0].args.sender?.toLowerCase()).to.equal(
          owner.account.address
        );
        expect(events[0].args.id).to.equal(3n);
        expect(events[0].args.name).to.equal("Sword");
        expect(events[0].args.price).to.equal(parseEther("0.01"));
        expect(events[0].args.status).to.equal(1);

        expect(await contract.read.getItem([3n])).to.eql({
          id: 3n,
          name: "Sword",
          price: parseEther("0.01"),
          status: 1,
        });
      });
    });
  });

  describe("purchaseItem", function () {
    describe("Validations", function () {
      it("Should revert with the purchase non-exist item", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.write.purchaseItem([3n, "userId"], {
            value: parseEther("0.01"),
            account: alice.account,
          })
        ).to.be.rejectedWith("ItemNotExist");
      });

      it("Should revert with insufficient balance", async function () {
        const { contract, alice } = await loadFixture(
          deployPlayshubShopFixture
        );

        await expect(
          contract.write.purchaseItem([1n, "mockUserId"], {
            value: parseEther("0.005"),
            account: alice.account,
          })
        ).to.be.rejectedWith("InsufficientBalance");
      });
    });

    describe("Events", function () {
      it("Should emit an event ItemPurchased", async function () {
        const { contract, alice, publicClient } = await loadFixture(
          deployPlayshubShopFixture
        );

        const hash = await contract.write.purchaseItem([1n, "mockUserId"], {
          value: parseEther("0.001"),
          account: alice.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await contract.getEvents.ItemPurchased();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.sender?.toLowerCase()).to.equal(
          alice.account.address
        );
        expect(events[0].args.id).to.equal(1n);
        expect(events[0].args.name).to.equal("Fragment");
        expect(events[0].args.price).to.equal(parseEther("0.001"));
        expect(events[0].args.userId).to.equal("mockUserId");
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
          contract.write.withdraw([parseEther("0.1")], {
            account: alice.account,
          })
        ).to.be.rejectedWith("OwnableUnauthorizedAccount");
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { contract, alice, owner, publicClient } = await loadFixture(
          deployPlayshubShopFixture
        );

        let hash = await contract.write.purchaseItem([1n, "mockUserId"], {
          value: parseEther("0.001"),
          account: alice.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await contract.write.withdraw([parseEther("0.001")]);
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await contract.getEvents.Withdrawn();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.sender?.toLowerCase()).to.equal(
          owner.account.address
        );
        expect(events[0].args.amount).to.equal(parseEther("0.001"));
      });
    });

    describe("Success", function () {
      it("Should update balance correctly", async function () {
        const { contract, alice, owner, publicClient } = await loadFixture(
          deployPlayshubShopFixture
        );

        const initialBalance = await publicClient.getBalance({
          address: owner.account.address,
        });

        let hash = await contract.write.purchaseItem([1n, "mockUserId"], {
          value: parseEther("0.001"),
          account: alice.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await contract.write.withdraw([parseEther("0.001")]);
        await publicClient.waitForTransactionReceipt({ hash });

        const receipt = await publicClient.getTransactionReceipt({ hash });

        const gasUsed = receipt?.gasUsed || BigInt(0);
        const gasPrice = receipt?.effectiveGasPrice || BigInt(0);
        const gasCost = gasUsed * gasPrice;

        const finalBalance = await publicClient.getBalance({
          address: owner.account.address,
        });

        expect(finalBalance - initialBalance + gasCost).to.equal(
          parseEther("0.001")
        );
      });
    });
  });
});
