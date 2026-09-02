import React, { useState } from 'react';
import { ethers } from 'ethers';
import './CreateNFT.css';

const CreateNFT = ({ contract, account, onSuccess }) => {
  const [tokenURI, setTokenURI] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('Please connect your wallet first!');
      return;
    }
    
    if (!tokenURI || !price) {
      setError('Please fill in all fields!');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const listingFee = await contract.listingFee();
      const priceInWei = ethers.parseEther(price);
      
      const tx = await contract.createNFT(
        tokenURI,
        priceInWei,
        { value: listingFee }
      );
      
      await tx.wait();
      
      setSuccess('✅ NFT created and listed successfully!');
      setTokenURI('');
      setPrice('');
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('❌ Error creating NFT:', error);
      setError(error.message || 'Failed to create NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-section">
      <h2>✨ Create & List NFT</h2>
      <p className="subtitle">Mint a new NFT and list it for sale on the marketplace</p>
      
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label>Token URI</label>
          <input
            type="text"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            placeholder="ipfs://QmExample... or https://..."
            className="input-field"
            required
          />
          <small>IPFS URI or URL pointing to your NFT metadata</small>
        </div>
        
        <div className="form-group">
          <label>Price (ETH)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.01"
            className="input-field"
            step="0.001"
            min="0.001"
            required
          />
          <small>Listing fee of 0.001 ETH will be charged</small>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <button 
          type="submit" 
          className="btn primary"
          disabled={loading || !account}
        >
          {loading ? '⏳ Creating...' : '🚀 Mint & List NFT'}
        </button>
        
        {!account && (
          <p className="warning">Please connect your wallet to create NFTs</p>
        )}
      </form>
    </div>
  );
};

export default CreateNFT;