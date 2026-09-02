const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let marketplace;
  let owner, user1, user2;
  let listingFee;
  const price = ethers.parseEther("0.01");
  const tokenURI = "ipfs://QmExampleMetadataURI";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    // ✅ FIXED: Pass owner address as initialOwner
    marketplace = await NFTMarketplace.deploy(owner.address);
    await marketplace.waitForDeployment();

    listingFee = await marketplace.listingFee();
  });

  it("Should create an NFT", async function () {
    await marketplace.connect(user1).createNFT(tokenURI, price, {
      value: listingFee
    });

    const nft = await marketplace.getNFT(1);
    expect(nft.owner).to.equal(user1.address);
    expect(nft.price).to.equal(price);
    expect(nft.isListed).to.equal(true);
  });

  it("Should buy an NFT", async function () {
    await marketplace.connect(user1).createNFT(tokenURI, price, {
      value: listingFee
    });

    await marketplace.connect(user2).buyNFT(1, {
      value: price
    });

    const nft = await marketplace.getNFT(1);
    expect(nft.owner).to.equal(user2.address);
    expect(nft.isListed).to.equal(false);
  });

  it("Should list and unlist NFT", async function () {
    await marketplace.connect(user1).createNFT(tokenURI, price, {
      value: listingFee
    });

    await marketplace.connect(user1).unlistNFT(1);
    let nft = await marketplace.getNFT(1);
    expect(nft.isListed).to.equal(false);

    await marketplace.connect(user1).listNFT(1, price);
    nft = await marketplace.getNFT(1);
    expect(nft.isListed).to.equal(true);
  });

  it("Should get listed NFTs", async function () {
    await marketplace.connect(user1).createNFT(tokenURI, price, {
      value: listingFee
    });
    await marketplace.connect(user2).createNFT(tokenURI, price, {
      value: listingFee
    });

    const listedNFTs = await marketplace.getListedNFTs();
    expect(listedNFTs.length).to.equal(2);
  });
});