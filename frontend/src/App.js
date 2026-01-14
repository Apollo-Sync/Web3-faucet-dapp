import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { faucetABI, tokenABI, TOKEN_ADDRESS } from './ethereum';

import './App.css';

const FAUCET_ADDRESS = "0x664224E312D5e3Cfd184764D895e37fbc21863f3";

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [ethBalance, setEthBalance] = useState('0.00');
  const [tokenBalance, setTokenBalance] = useState('0.00');

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } else {
      alert("Please install EVM wallet!");
    }
  }

  async function requestTokens() {
    if (!account) return alert("Connect wallet trước");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, signer);

    try {
      setStatus("Đang gửi transaction...");
      const tx = await faucet.requestTokens();
      await tx.wait();
      setStatus("Thành công! Nhận được 100 APT");
    } catch (err) {
      setStatus("Lỗi: " + (err.reason || err.message));
    }
  }

  async function fetchBalances() {
    if (!account || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBal).slice(0, 6));

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);
      const tokenBalRaw = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setTokenBalance(ethers.formatUnits(tokenBalRaw, decimals).slice(0, 6));
    } catch (err) {
      console.error("Lỗi fetch balance:", err);
      setEthBalance("Error");
      setTokenBalance("Error");
    }
  }

  useEffect(() => {
    if (account) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [account]);

  return (
    <div className="app-container">
      {/* Header giữ nguyên: logo + địa chỉ ví */}
      <header className="header">
        <div className="header-left">
          <h2 className="neon-text-small">Apollo Faucet</h2>
        </div>
        <div className="wallet-section">
          {account ? (
            <span className="connected neon-text">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          ) : (
            <button 
              className="neon-button neon-text connect-btn" 
              onClick={connectWallet}
            >
              Connect EVM Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main content - card chính giờ chứa cả balances */}
      <main className="main-content">
        <div className="card">
          <h1 className="neon-text">Apollo Token Faucet (Sepolia)</h1>

          {/* Mục Your Balance mới - đặt ngay dưới tiêu đề */}
          {account && (
            <div className="balance-section neon-text">
              <div className="balance-title">Your Balance</div>
              <div className="balance-items">
                <span className="balance-item eth-balance">
                  ETH: {ethBalance}
                </span>
                <span className="balance-item token-balance">
                  APT: {tokenBalance}
                </span>
              </div>
            </div>
          )}

          <button 
            className="neon-button neon-text request-btn" 
            onClick={requestTokens} 
            disabled={!account}
          >
            Request 100 APT
          </button>

          {status && <p className="status neon-text">{status}</p>}
        </div>
      </main>

      {/* Footer giữ nguyên */}
      <footer className="footer">
        <div className="social-icons">
          <a href="https://x.com/Apollo_sync" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
            𝕏
          </a>
          <a href="https://t.me/Apollosync" target="_blank" rel="noopener noreferrer" title="Telegram">
            ✈️
          </a>
          <a href="https://github.com/Apollo-Sync" target="_blank" rel="noopener noreferrer" title="GitHub">
            🐱
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
            📸
          </a>
          <a href="https://discord.com/invite/zama" target="_blank" rel="noopener noreferrer" title="Discord">
            🎮
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" title="YouTube">
            ▶️
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
