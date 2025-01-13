/* This test contract is for testing the basic contract to check whether we can access the contracts that we have or not.*/


const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockContract Gas Consumption", function () {
  let mockContract;
  let deployer;

  before(async function () {
    // Get the deployer account
    [deployer] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy the MockContract
    const MockContract = await ethers.getContractFactory("MockContract");
    mockContract = await MockContract.deploy(); // Deploy the contract
    await mockContract.waitForDeployment(); // Wait for the deployment to complete
  });

  it("should calculate gas consumption for setValue function", async function () {
    const tx = await mockContract.setValue(42); // Call the function
    const receipt = await tx.wait(); // Wait for the transaction to be mined

    console.log(`Gas Used for setValue: ${receipt.gasUsed.toString()} units`);

    // Assert that gasUsed is a BigInt and greater than 0
    expect(receipt.gasUsed).to.be.a("bigint");
    expect(receipt.gasUsed).to.be.greaterThan(0n);
  });

  it("should calculate gas consumption for receiving Ether", async function () {
    const tx = await deployer.sendTransaction({
      to: mockContract.target, // Use .target for the deployed contract address
      value: ethers.parseEther("1"), // Send 1 Ether
    });

    const receipt = await tx.wait();

    console.log(`Gas Used for receiving Ether: ${receipt.gasUsed.toString()} units`);

    // Assert that gasUsed is a BigInt and greater than 0
    expect(receipt.gasUsed).to.be.a("bigint");
    expect(receipt.gasUsed).to.be.greaterThan(0n);
  });
});
