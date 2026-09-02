const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying NFT Marketplace...");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);

  // Get the contract factory
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  
  // ✅ FIXED: Pass deployer address as initialOwner
  const marketplace = await NFTMarketplace.deploy(deployer.address);
  
  await marketplace.waitForDeployment();
  
  const address = await marketplace.getAddress();
  console.log("✅ NFT Marketplace deployed to:", address);
  
  const listingFee = await marketplace.listingFee();
  console.log("💰 Listing Fee:", hre.ethers.formatEther(listingFee), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });