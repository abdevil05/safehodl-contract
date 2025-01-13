/* This test contract check the gas consumption of AccontFacetV2.sol locally means using a local hardhat network.*/

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = ethers;

// IERC20 ABI for token interactions
const IERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

describe("AccountFacetV2 Gas Tests with Deployed Contracts", function () {
  let accountFacet;
  let entryPoint;
  let verificationFacet;
  let owner;
  let user;
  let beneficiary;
  let erc20Token;

  // Constants from deployed contracts
  const ENTRYPOINT_ADDRESS = process.env.ENTRYPOINT;
  const SECP256R1_VERIFIER_ADDRESS = process.env.SECP256R1_VERIFIER;
  const ACCOUNT_FACET_ADDRESS = process.env.ACCOUNT_FACET;
  const ERC20_CONTRACT_ADDRESS = "0xF757Dd3123b69795d43cB6b58556b3c6786eAc13";
  const PAYMASTER_ADDRESS = "0xDd74396fb58c32247d8E2410e853a73f71053252";

  before(async function() {
    // Check required addresses
    if (!SECP256R1_VERIFIER_ADDRESS || !ACCOUNT_FACET_ADDRESS) {
      throw new Error("Missing required environment variables");
    }
  });

  beforeEach(async function () {
    [owner, user, beneficiary] = await ethers.getSigners();

    try {
      // Connect to existing contracts
      entryPoint = await ethers.getContractAt("IEntryPoint", ENTRYPOINT_ADDRESS);
      verificationFacet = await ethers.getContractAt("Secp256r1VerificationFacet", SECP256R1_VERIFIER_ADDRESS);
      accountFacet = await ethers.getContractAt("AccountFacetV2", ACCOUNT_FACET_ADDRESS);
      
      // Connect to ERC20 token using minimal ABI
      erc20Token = new ethers.Contract(ERC20_CONTRACT_ADDRESS, IERC20_ABI, owner);

      // Fund the owner account with some ETH to handle transactions
      await owner.sendTransaction({
        to: ENTRYPOINT_ADDRESS,
        value: parseEther("1.0") 
      });

    } catch (error) {
      console.error("Error connecting to contracts:", error);
      throw error;
    }
  });

  async function measureGas(tx) {
    const receipt = await tx.wait();
    return receipt.gasUsed;
  }

  describe("Gas Consumption Tests", function () {
    it("Should measure gas for execute function", async function () {

      const dest = "0x54897922bCef6f7e38806EdddD80B72DD7185043";
      const value = parseEther("0.001"); // Reduced value to ensure enough funds for gas
      const data = "0x";
      
      const approveToken = ERC20_CONTRACT_ADDRESS;
      const approveData = erc20Token.interface.encodeFunctionData("approve", [
        PAYMASTER_ADDRESS,
        parseEther("0.1")
      ]);

      // Execute as EntryPoint
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
      
      const entryPointSigner = await ethers.getSigner(ENTRYPOINT_ADDRESS);
      
      const tx = await accountFacet.connect(entryPointSigner).execute(
        dest,
        value,
        data,
        approveToken,
        approveData
      );

        // Stop impersonating EntryPoint
        await network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [ENTRYPOINT_ADDRESS],
        });
      
      const gasUsed = await measureGas(tx);
      console.log("Gas used for execute:", gasUsed.toString());
      expect(gasUsed).to.be.gt(0);
    });

    it("Should measure gas for executeBatch function", async function () {
      // Get actual addresses instead of using signer objects directly
      const userAddress = "0x54897922bCef6f7e38806EdddD80B72DD7185043";
      const beneficiaryAddress = await beneficiary.getAddress();
      
      const dests = [userAddress, beneficiaryAddress];
      const values = [
        parseEther("0.01"),
        parseEther("0.01")
      ];
      const datas = ["0x", "0x"];

      // Impersonate EntryPoint
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
      
      const entryPointSigner = await ethers.getSigner(ENTRYPOINT_ADDRESS);
      
      const tx = await accountFacet.connect(entryPointSigner).executeBatch(
        dests,
        values,
        datas
      );
      
      const gasUsed = await measureGas(tx);
      console.log("Gas used for executeBatch:", gasUsed.toString());
      expect(gasUsed).to.be.gt(0);

      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
    });

    it("Should measure gas for token approval", async function () {
      const approveAmount = parseEther("1000");
      const approveData = erc20Token.interface.encodeFunctionData("approve", [
        await user.getAddress(),
        approveAmount
      ]);

      // Impersonate EntryPoint
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
      
      const entryPointSigner = await ethers.getSigner(ENTRYPOINT_ADDRESS);
      
      const tx = await accountFacet.connect(entryPointSigner).execute(
        ERC20_CONTRACT_ADDRESS,
        0,
        approveData,
        ethers.ZeroAddress,
        "0x"
      );
      
      const gasUsed = await measureGas(tx);
      console.log("Gas used for token approval:", gasUsed.toString());
      expect(gasUsed).to.be.gt(0);

      await network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
    });

    it("Should measure gas for withdrawing deposits", async function () {
      // First ensure the account has some deposits in EntryPoint
      await owner.sendTransaction({
        to: ENTRYPOINT_ADDRESS,
        value: parseEther("1.0")
      });
    
      // Impersonate EntryPoint
      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ENTRYPOINT_ADDRESS],
      });
      
      const entryPointSigner = await ethers.getSigner(ENTRYPOINT_ADDRESS);
      
      // Ensure EntryPoint has enough ETH for gas
      await owner.sendTransaction({
        to: ENTRYPOINT_ADDRESS,
        value: parseEther("0.1")
      });
    
      // Get beneficiary address
      const beneficiaryAddress = await beneficiary.getAddress();
      
      try {
        const tx = await accountFacet.connect(entryPointSigner).withdrawDepositTo(
          beneficiaryAddress,
          parseEther("0.1")
        );
        
        const gasUsed = await measureGas(tx);
        console.log("Gas used for withdrawing deposits:", gasUsed.toString());
        expect(gasUsed).to.be.gt(0);
      } catch (error) {
        console.error("Withdrawal error:", error);
        throw error;
      } finally {
        // Stop impersonating EntryPoint
        await network.provider.request({
          method: "hardhat_stopImpersonatingAccount",
          params: [ENTRYPOINT_ADDRESS],
        });
      }
    });
  });
});

