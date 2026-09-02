import  { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Navbar from './components/Navbar';
import CreateNFT from './components/CreateNFT';
import NFTList from './components/NFTList';
import MyNFTs from './components/MyNFTs';
import { ThreeDots } from 'react-loader-spinner';

// ============================================
// IMPORTANT: After compiling your contract, copy the FULL ABI
// from: artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json
// I've included the essential functions below
// ============================================

const CONTRACT_ABI = [
  // ========== VIEW FUNCTIONS ==========
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getNFT",
    "outputs": [{
      "components": [
        { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
        { "internalType": "address payable", "name": "owner", "type": "address" },
        { "internalType": "uint256", "name": "price", "type": "uint256" },
        { "internalType": "bool", "name": "isListed", "type": "bool" }
      ],
      "internalType": "struct NFTMarketplace.NFTItem",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getListedNFTs",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "getOwnedNFTs",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "listingFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  // ========== WRITE FUNCTIONS ==========
  {
    "inputs": [
      { "internalType": "string", "name": "tokenURI", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "createNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "unlistNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ⚠️ UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
// After running 'npx hardhat run scripts/deploy.js --network localhost'
// Copy the address that prints out and paste it here:
const CONTRACT_ADDRESS = '0x0Eb633B3dfc7dBCeA16883F019F5f85D07fd53AA';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [nfts, setNfts] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contract);
        setAccount(address);
        
        console.log('✅ Connected:', address);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert('Error connecting wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load NFTs
  const loadNFTs = useCallback(async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      // Get listed NFTs
      const listedIds = await contract.getListedNFTs();
      const nftData = [];
      
      for (let id of listedIds) {
        const nft = await contract.getNFT(id);
        nftData.push({
          id: id.toString(),
          owner: nft.owner,
          price: ethers.formatEther(nft.price),
          isListed: nft.isListed
        });
      }
      setNfts(nftData);
      
      // Get user's NFTs
      if (account) {
        const ownedIds = await contract.getOwnedNFTs(account);
        const ownedData = [];
        for (let id of ownedIds) {
          const nft = await contract.getNFT(id);
          ownedData.push({
            id: id.toString(),
            owner: nft.owner,
            price: ethers.formatEther(nft.price),
            isListed: nft.isListed
          });
        }
        setMyNFTs(ownedData);
      }
      
    } catch (error) {
      console.error('❌ Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  // Load on contract change
  useEffect(() => {
    if (contract) {
      loadNFTs();
    }
  }, [contract, loadNFTs, refresh]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          window.location.reload();
        } else {
          setAccount('');
        }
      });
    }
  }, []);

  const refreshData = () => setRefresh(!refresh);

  return (
    <div className="app">
      <Navbar 
        account={account} 
        connectWallet={connectWallet} 
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main className="container">
        {loading ? (
          <div className="loader-container">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#7a5cff"
              ariaLabel="three-dots-loading"
              visible={true}
            />
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'create' && (
              <CreateNFT 
                contract={contract} 
                account={account} 
                onSuccess={refreshData}
              />
            )}
            
            {activeTab === 'list' && (
              <NFTList 
                nfts={nfts} 
                contract={contract} 
                account={account}
                onBuy={refreshData}
              />
            )}
            
            {activeTab === 'my' && (
              <MyNFTs 
                nfts={myNFTs} 
                contract={contract} 
                account={account}
                onUpdate={refreshData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;