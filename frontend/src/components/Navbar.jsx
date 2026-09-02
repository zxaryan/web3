import React from 'react';
import './Navbar.css';

const Navbar = ({ account, connectWallet, loading, activeTab, setActiveTab }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🎨</span>
        <span className="brand-text">NFT Marketplace</span>
      </div>
      
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Listed NFTs
        </button>
        <button 
          className={`nav-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ✨ Create NFT
        </button>
        <button 
          className={`nav-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          💼 My NFTs
        </button>
      </div>
      
      <button 
        className="connect-btn"
        onClick={connectWallet}
        disabled={loading}
      >
        {account ? (
          <span>🟢 {account.slice(0,6)}...{account.slice(-4)}</span>
        ) : (
          <span>🔗 Connect Wallet</span>
        )}
      </button>
    </nav>
  );
};

export default Navbar;