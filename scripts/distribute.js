const { ethers } = require("hardhat");
const fs = require("fs");
const { parse } = require("csv-parse/sync");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Interacting with the reward distributor contract using the account:",
    deployer.address
  );

  // Total rewards in wei (0.01 ETH) converted to BigInt
  const totalReward = BigInt(ethers.parseEther("0.01").toString());

  // Read and parse the CSV file
  const csvData = fs.readFileSync("holders.csv", { encoding: "utf-8" });
  const records = parse(csvData, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
  });

  // Total supply in wei (assuming the total supply is 100 million tokens)
  const totalSupply = BigInt(ethers.parseUnits("100000000", 18).toString());

  let addresses = [];
  let rewards = [];
  let balances = [];

  const gasPrice = ethers.parseUnits("5", "gwei");

  for (let record of records) {
    let address = record[0]; // First column is the address
    let balanceString = record[1].replace(/,/g, ""); // Second column is the balance, remove commas

    // Check if the balance string is a valid number before proceeding
    if (!isNaN(parseFloat(balanceString)) && parseFloat(balanceString) > 0) {
      // Convert the balance string to BigInt
      let balance = BigInt(ethers.parseUnits(balanceString, 18).toString());

      // Calculate the reward using BigInt arithmetic
      let reward = (balance * totalReward) / totalSupply; // BigInt multiplication and division

      console.log("Address: ", address);
      //console.log("Balance: ", balance.toString());
      console.log("Reward: ", reward.toString());

      addresses.push(address);
      balances.push(balance.toString()); // Convert back to BigNumber for smart contract

      // Send the reward directly from the deployer account
      const tx = await deployer.sendTransaction({
        to: address,
        value: reward,
        gasLimit: 21000,
      });

      await tx.wait(); // Wait for the transaction to be mined
      console.log(`Reward sent to ${address}, tx hash: ${tx.hash}`);
      //console.log(`Reward sent to ${address}`);
    } else {
      console.error(
        "Invalid balance data for address",
        address,
        "with balance data:",
        balanceString
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
