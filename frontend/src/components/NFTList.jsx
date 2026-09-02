import React, { useState } from 'react';
import { ethers } from 'ethers';
import './NFTList.css';

const NFTList = ({ nfts, contract, account, onBuy }) => {
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState('');

  const handleBuy = async (nft) => {
    if (!account) {
      setError('Please connect your wallet first!');
      return;
    }
    
    if (nft.owner.toLowerCase() === account.toLowerCase()) {
      setError('You own this NFT!');
      return;
    }
    
    try {
      setBuying(nft.id);
      setError('');
      
      const priceInWei = ethers.parseEther(nft.price);
      const tx = await contract.buyNFT(nft.id, { value: priceInWei });
      await tx.wait();
      
      if (onBuy) onBuy();
      setError('✅ NFT purchased successfully!');
      
    } catch (error) {
      console.error('❌ Error buying NFT:', error);
      setError(error.message || 'Failed to buy NFT');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="nft-list-section">
      <h2>📋 Listed NFTs</h2>
      <p className="subtitle">{nfts.length} NFTs available for purchase</p>
      
      {error && <div className={`message ${error.includes('✅') ? 'success' : 'error'}`}>{error}</div>}
      
      {nfts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎨</span>
          <p>No NFTs listed yet</p>
          <small>Be the first to create and list an NFT!</small>
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
                <div className="nft-owner">
                  Owner: {nft.owner.slice(0,6)}...{nft.owner.slice(-4)}
                </div>
                {account && nft.owner.toLowerCase() !== account.toLowerCase() && (
                  <button
                    className="btn buy-btn"
                    onClick={() => handleBuy(nft)}
                    disabled={buying === nft.id}
                  >
                    {buying === nft.id ? '⏳ Buying...' : '🛒 Buy Now'}
                  </button>
                )}
                {account && nft.owner.toLowerCase() === account.toLowerCase() && (
                  <div className="owned-badge">👑 Your NFT</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTList;