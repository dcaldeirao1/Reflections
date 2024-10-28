require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  networks: {
    bnb: {
      url: process.env.ALCHEMY_BNB_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545", // This is the default URL for the Hardhat node
    },
  },
};
