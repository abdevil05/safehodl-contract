// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
// require("hardhat-gas-reporter");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   // defaultNetwork: "localhost",
//   defaultNetwork: "amoy",
//   networks: {
//     hardhat: {  
//       // Add this network for local testing
//       mining: {
//         auto: true,
//         interval: 0
//       },
//       allowUnlimitedContractSize: true,
//       accounts: {
//         privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
//         accountsBalance: "10000000000000000000000" // 10000 ETH
//       },
//       blockGasLimit: 30000000,
//       chainId: 31337,
//       gasPrice: 50000000000,
//     },
    
//     amoy: {
//       url: process.env.RPC_URL,
//       accounts: [process.env.PRIVATE_KEY],
//     },
//   },
//   mocha: {
//     timeout: 120000
//   },
//   solidity: {
//     version: "0.8.21",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 1000,
//       },
//     },
//   },
  
//   gasReporter: {
//     enabled: true,
//     currency: 'USD',
//     gasPrice: 21,
//     showMethodSig: true,
//     showTimeSpent: true,
//   },
//   etherscan: {
//     apiKey:process.env.API_KEY
//   },
// };


require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  // defaultNetwork: "amoy",
  // networks: {
  //   amoy: {
  //     url: process.env.RPC_URL,
  //     accounts: [process.env.PRIVATE_KEY],
  //   },
  // },
  solidity: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey:process.env.API_KEY
  },
};