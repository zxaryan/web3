import React, { useState } from 'react';
import { ethers } from 'ethers';
import './MyNFTs.css';

const MyNFTs = ({ nfts, contract, account, onUpdate }) => {
  const [action, setAction] = useState(null);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleList = async (nftId, newPrice) => {
    try {
      setAction(nftId);
      setError('');
      setSuccess('');
      
      const priceInWei = ethers.parseEther(newPrice);
      const tx = await contract.listNFT(nftId, priceInWei);
      await tx.wait();
      
      setSuccess('✅ NFT listed successfully!');
      if (onUpdate) onUpdate();
      setPrice('');
      
    } catch (error) {
      console.error('❌ Error listing NFT:', error);
      setError(error.message || 'Failed to list NFT');
    } finally {
      setAction(null);
    }
  };

  const handleUnlist = async (nftId) => {
    try {
      setAction(nftId);
      setError('');
      setSuccess('');
      
      const tx = await contract.unlistNFT(nftId);
      await tx.wait();
      
      setSuccess('✅ NFT unlisted successfully!');
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('❌ Error unlisting NFT:', error);
      setError(error.message || 'Failed to unlist NFT');
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="my-nfts-section">
      <h2>💼 My NFTs</h2>
      <p className="subtitle">You own {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}</p>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      
      {nfts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏦</span>
          <p>You don't own any NFTs yet</p>
          <small>Go to "Create NFT" to mint your first one!</small>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <div key={nft.id} className="nft-card">
              <div className="nft-image-placeholder">
                <span>🖼️</span>
              </div>
              <div className="nft-info">
                <div className="nft-id">NFT #{nft.id}</div>
                <div className="nft-price">{nft.price} ETH</div>
                <div className="nft-status">
                  {nft.isListed ? '📌 Listed' : '📦 Not Listed'}
                </div>
                
                {!nft.isListed ? (
                  <div className="list-form">
                    <input
                      type="number"
                      placeholder="Price in ETH"
                      className="price-input"
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.001"
                      min="0.001"
                    />
                    <button
                      className="btn list-btn"
                      onClick={() => handleList(nft.id, price)}
                      disabled={action === nft.id || !price}
                    >
                      {action === nft.id ? '⏳ Processing...' : '📤 List for Sale'}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn unlist-btn"
                    onClick={() => handleUnlist(nft.id)}
                    disabled={action === nft.id}
                  >
                    {action === nft.id ? '⏳ Processing...' : '🔴 Unlist'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;