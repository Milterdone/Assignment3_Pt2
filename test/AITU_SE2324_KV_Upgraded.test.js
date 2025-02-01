const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITU_SE2324_KV_Updated Token", function () {
  let Token, token, owner, addr1, addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("AITU_SE2324_KV_Updated");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await Token.deploy(5000); // Deploying 5k tokens for each testcase
  });

  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("AITU_SE2324_KV_Updated");
    expect(await token.symbol()).to.equal("AITU");
  });

  it("Should set deployer as owner", async function () {
    expect(await token.owner()).to.equal(owner.address);
  });

  it("Should assign initial supply to owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(5000n * 10n ** 18n);
    expect(ownerBalance).to.equal(5000n * 10n ** 18n);
  }); // So this is minting

  it("Should transfer tokens correctly", async function () {
    const amount = 100n;
    await token.transfer(addr1.address, amount);
    expect(await token.balanceOf(addr1.address)).to.equal(amount);
    expect(await token.balanceOf(owner.address)).to.equal(5000n * 10n ** 18n - amount);
  });

  it("Should update latestTransaction after transfer", async function () {
    await token.transfer(addr1.address, 50);
    const sent = await token.getTransactionSender();
    expect(sent).to.equal(owner.address);
    const recieved = await token.getTransactionReceiver();
    expect(recieved).to.equal(addr1.address);
  });

  /*
    So, here too. Allowance and transferFrom
    Writing tests is quite straightforward
    It's literally spelling out what code will do

  it("Should handle transferFrom with allowance", async function () {
    await token.approve(addr1.address, 200);
    await token.connect(addr1).transferFrom(owner.address, addr2.address, 150);
    expect(await token.balanceOf(addr2.address)).to.equal(150);
  });

  it("Should fail transferFrom without enough allowance", async function () {
    await token.approve(addr1.address, 50);
    await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, 100))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
  }); */

  it("Should fail transfer if balance is insufficient", async function () {
    await expect(token.connect(addr1).transfer(addr2.address, 100))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  }); 

  it("Should return latest transaction timestamp", async function () {
    await token.transfer(addr1.address, 100);
    const timeString = await token.getLatestTransactionTimestamp();
    expect(timeString).to.include("seconds ago");
  });
});

