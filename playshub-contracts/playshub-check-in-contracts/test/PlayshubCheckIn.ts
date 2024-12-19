import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

describe("CheckIn", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCheckInFixture() {
    const [owner, alice] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const mockERC20 = await hre.viem.deployContract("MockERC20", []);
    const hash = await mockERC20.write.mint([parseEther("10")]);

    await publicClient.waitForTransactionReceipt({ hash });

    const checkIn = await hre.viem.deployContract("PlayshubCheckIn", [
      owner.account.address,
      [zeroAddress, mockERC20.address],
      [parseEther("0.000075"), parseEther("1")],
    ]);

    return {
      checkIn,
      owner,
      alice,
      publicClient,
      mockERC20,
    };
  }

  describe("Deployment", function () {
    it("Should initialize contracts", async () => {
      const { checkIn, owner } = await loadFixture(deployCheckInFixture);

      expect((await checkIn.read.owner()).toLowerCase()).to.equal(
        owner.account.address
      );
      expect(await checkIn.read.checkInTokenOf([zeroAddress])).to.eql({
        isSupported: true,
        value: parseEther("0.000075"),
      });
    });
  });

  describe("CheckIn", function () {
    describe("Validations", function () {});

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { checkIn, publicClient, owner } = await loadFixture(
          deployCheckInFixture
        );

        const hash = await checkIn.write.checkIn(["mockUserId"], {
          value: parseEther("0.000075"),
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.CheckedIn();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.sender?.toLowerCase()).to.equal(
          owner.account.address
        );
        expect(events[0].args.token).to.equal(zeroAddress);
        expect(events[0].args.count).to.equal(1n);

        expect(
          (await checkIn.read.checkInRecordOf(["mockUserId"])).count
        ).to.eql(1n);

        expect(
          await publicClient.getBalance({ address: checkIn.address })
        ).to.eql(parseEther("0.000075"));
      });

      it("Should emit an event on withdrawals with ERC20", async function () {
        const { checkIn, publicClient, owner, mockERC20 } = await loadFixture(
          deployCheckInFixture
        );

        let hash = await mockERC20.write.approve([
          checkIn.address,
          parseEther("1"),
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await checkIn.write.checkIn([mockERC20.address, "mockUserId"]);
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.CheckedIn();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.sender?.toLowerCase()).to.equal(
          owner.account.address
        );
        expect(events[0].args.token?.toLowerCase()).to.equal(mockERC20.address);
        expect(events[0].args.count).to.equal(1n);

        expect(
          (await checkIn.read.checkInRecordOf(["mockUserId"])).count
        ).to.eql(1n);

        expect(await mockERC20.read.balanceOf([checkIn.address])).to.eql(
          parseEther("1")
        );
      });
    });
  });

  describe("addSupportedToken", function () {
    describe("Validations", function () {});
    describe("Events", function () {
      it("Should emit an event on adding a supported token", async function () {
        const { checkIn, publicClient, alice } = await loadFixture(
          deployCheckInFixture
        );

        const hash = await checkIn.write.addSupportedToken([
          alice.account.address,
          parseEther("1"),
        ]);

        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.TokenSupportAdded();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.token).to.equal(
          getAddress(alice.account.address)
        );
        expect(events[0].args.value).to.equal(parseEther("1"));

        expect(
          await checkIn.read.checkInTokenOf([alice.account.address])
        ).to.eql({
          isSupported: true,
          value: parseEther("1"),
        });
      });
    });
  });

  describe("removeSupportToken", function () {
    describe("Validations", function () {});
    describe("Events", function () {
      it("Should emit an event on removing a supported token", async function () {
        const { checkIn, mockERC20, publicClient } = await loadFixture(
          deployCheckInFixture
        );

        expect(await checkIn.read.checkInTokenOf([mockERC20.address])).to.eql({
          isSupported: true,
          value: parseEther("1"),
        });

        const hash = await checkIn.write.removeSupportToken([
          mockERC20.address,
        ]);

        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.TokenSupportRemoved();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.token).to.equal(getAddress(mockERC20.address));

        expect(await checkIn.read.checkInTokenOf([mockERC20.address])).to.eql({
          isSupported: false,
          value: parseEther("0"),
        });
      });
    });
  });

  describe("pause", function () {
    describe("Validations", function () {});
    describe("Events", function () {});
  });

  describe("unpause", function () {
    describe("Validations", function () {});
    describe("Events", function () {});
  });

  describe("withdraw", function () {
    describe("Validations", function () {});
    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { checkIn, publicClient, owner, alice } = await loadFixture(
          deployCheckInFixture
        );

        const initialBalance = await publicClient.getBalance({
          address: alice.account.address,
        });

        let hash = await checkIn.write.checkIn(["mockUserId"], {
          value: parseEther("0.000075"),
        });
        await publicClient.waitForTransactionReceipt({ hash });
        hash = await checkIn.write.checkIn(["mockUserId"], {
          value: parseEther("0.000075"),
        });
        await publicClient.waitForTransactionReceipt({ hash });
        hash = await checkIn.write.checkIn(["mockUserId"], {
          value: parseEther("0.000075"),
        });
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await checkIn.write.withdraw([
          alice.account.address,
          parseEther("0.000225"),
        ]);

        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.Withdrawn();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.to?.toLowerCase()).to.equal(
          alice.account.address
        );
        expect(events[0].args.amount).to.equal(parseEther("0.000225"));

        expect(
          await publicClient.getBalance({ address: checkIn.address })
        ).to.eql(parseEther("0"));

        expect(
          await publicClient.getBalance({ address: alice.account.address })
        ).to.eql(initialBalance + parseEther("0.000225"));
      });

      it("Should emit an event on withdrawals ERC20", async function () {
        const { checkIn, publicClient, owner, alice, mockERC20 } =
          await loadFixture(deployCheckInFixture);

        let hash = await mockERC20.write.transfer([
          checkIn.address,
          parseEther("1"),
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        hash = await checkIn.write.withdraw([
          mockERC20.address,
          alice.account.address,
          parseEther("0.1"),
        ]);
        await publicClient.waitForTransactionReceipt({ hash });

        const events = await checkIn.getEvents.Withdrawn();
        expect(events).to.have.lengthOf(1);
        expect(events[0].args.to?.toLowerCase()).to.equal(
          alice.account.address
        );
        expect(events[0].args.amount).to.equal(parseEther("0.1"));

        expect(await mockERC20.read.balanceOf([checkIn.address])).to.eql(
          parseEther("0.9")
        );

        expect(await mockERC20.read.balanceOf([alice.account.address])).to.eql(
          parseEther("0.1")
        );
      });
    });
  });
});
