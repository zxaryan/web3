// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public listingFee = 0.001 ether;

    struct NFTItem {
        uint256 tokenId;
        address payable owner;
        uint256 price;
        bool isListed;
    }

    mapping(uint256 => NFTItem) public nfts;

    event NFTCreated(uint256 indexed tokenId, address indexed creator, uint256 price);
    event NFTBought(uint256 indexed tokenId, address indexed buyer, uint256 price);

    // ✅ ALTERNATIVE CONSTRUCTOR - uses _transferOwnership instead of direct call
    constructor(address initialOwner) 
        ERC721("NFT Marketplace", "NFTM") 
    {
        // This manually sets the owner instead of using Ownable's constructor
        _transferOwnership(initialOwner);
    }

    function createNFT(string memory tokenURI, uint256 price) public payable {
        require(msg.value >= listingFee, "Listing fee required");
        require(price > 0, "Price must be > 0");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        nfts[newTokenId] = NFTItem({
            tokenId: newTokenId,
            owner: payable(msg.sender),
            price: price,
            isListed: true
        });
        
        emit NFTCreated(newTokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) public payable {
        NFTItem storage nft = nfts[tokenId];
        
        require(nft.isListed, "NFT not listed");
        require(msg.value >= nft.price, "Insufficient funds");
        require(nft.owner != msg.sender, "Cannot buy your own NFT");
        
        (bool success, ) = nft.owner.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        address previousOwner = nft.owner;
        _transfer(previousOwner, msg.sender, tokenId);
        
        nft.owner = payable(msg.sender);
        nft.isListed = false;
        
        emit NFTBought(tokenId, msg.sender, nft.price);
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be > 0");
        
        nfts[tokenId].price = price;
        nfts[tokenId].isListed = true;
        nfts[tokenId].owner = payable(msg.sender);
    }

    function unlistNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(nfts[tokenId].isListed, "Not listed");
        
        nfts[tokenId].isListed = false;
    }

    function getNFT(uint256 tokenId) public view returns (NFTItem memory) {
        return nfts[tokenId];
    }

    function getOwnedNFTs(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        return tokens;
    }

    function getListedNFTs() public view returns (uint256[] memory) {
        uint256 listedCount = 0;
        
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (nfts[i].isListed) {
                listedCount++;
            }
        }
        
        uint256[] memory listedTokens = new uint256[](listedCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (nfts[i].isListed) {
                listedTokens[index] = i;
                index++;
            }
        }
        
        return listedTokens;
    }

    function setListingFee(uint256 newFee) public onlyOwner {
        listingFee = newFee;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}