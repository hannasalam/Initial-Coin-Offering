require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby:{
      url: ALCHEMY_API_KEY_URL,
      accounts: [RINKEBY_PRIVATE_KEY]
    }
  }
};
//0xA2241a61304C1942Ea25FaeC6E23445a1315Ec80