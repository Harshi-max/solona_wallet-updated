import React, { useEffect, useState } from "react";
import {
  Connection,
  PublicKey,
  clusterApiUrl
} from "@solana/web3.js";
import "./App.css"; // Make sure this line is included!

const SOLANA_NETWORK = "mainnet-beta";
const SOLSCAN_API = "https://public-api.solscan.io/account/transactions?account=";
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const connection = new Connection(clusterApiUrl(SOLANA_NETWORK));

  // Connect Wallet
  const connectWallet = async () => {
    const provider = window?.solana;
    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        setWalletAddress(resp.publicKey.toString());
      } catch (err) {
        console.error("Connection rejected:", err.message);
      }
    } else {
      alert("Please install Phantom Wallet!");
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    const provider = window?.solana;
    if (provider?.isPhantom) {
      provider.disconnect();
      setWalletAddress(null);
      setBalance(0);
      setTransactions([]);
    }
  };

  // Fetch Wallet Balance
  const fetchBalance = async () => {
    if (!walletAddress) return;
    try {
      const publicKey = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // convert lamports to SOL
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  };

  // Fetch SOL Price
  const fetchSOLPrice = async () => {
    try {
      const res = await fetch(COINGECKO_API);
      const data = await res.json();
      setSolPrice(data.solana.usd);
    } catch (err) {
      console.error("Price fetch error:", err);
    }
  };

  // Fetch Transaction History
  const fetchTransactions = async () => {
    if (!walletAddress) return;
    try {
      const res = await fetch(`${SOLSCAN_API}${walletAddress}&limit=5`);
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
    }
  };

  // Wallet event listeners
  useEffect(() => {
    const provider = window?.solana;
    if (!provider) return;

    provider.on("connect", () => console.log("Wallet connected"));
    provider.on("disconnect", () => console.log("Wallet disconnected"));
    provider.on("accountChanged", (pubkey) => {
      console.log("Account changed to", pubkey.toString());
      setWalletAddress(pubkey.toString());
    });

    return () => {
      provider?.removeAllListeners("connect");
      provider?.removeAllListeners("disconnect");
      provider?.removeAllListeners("accountChanged");
    };
  }, []);

  // Load balance, transactions, and price on wallet connect
  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
      fetchTransactions();
      fetchSOLPrice();
      const balanceInterval = setInterval(fetchBalance, 10000);
      const priceInterval = setInterval(fetchSOLPrice, 30000);
      return () => {
        clearInterval(balanceInterval);
        clearInterval(priceInterval);
      };
    }
  }, [walletAddress]);

  return (
    <div className="app-container">
      {/* Background Effects */}
      <div className="floating-text">Solana</div>
      <div className="floating-text">Wallet</div>
      <div className="floating-text">Blockchain</div>
      <div className="glow glow1"></div>
      <div className="glow glow2"></div>

      {/* Wallet UI */}
      <div style={styles.card}>
        <h1 style={styles.title}>🚀 Solana Wallet Tracker</h1>

        {walletAddress ? (
          <>
            <p><strong>Wallet:</strong> {walletAddress}</p>
            <p><strong>SOL Balance:</strong> {balance.toFixed(4)} SOL</p>
            <p><strong>SOL/USD:</strong> ${solPrice}</p>

            <h3>🧾 Recent Transactions:</h3>
            <ul style={styles.list}>
              {transactions.length === 0 ? (
                <li>No transactions found.</li>
              ) : (
                transactions.map((tx, index) => (
                  <li key={index}>
                    <a
                      href={`https://solscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.txHash.slice(0, 8)}... |{" "}
                      {new Date(tx.blockTime * 1000).toLocaleString()}
                    </a>
                  </li>
                ))
              )}
            </ul>

            <button onClick={disconnectWallet} style={styles.buttonRed}>
              Disconnect
            </button>
          </>
        ) : (
          <button onClick={connectWallet} style={styles.buttonGreen}>
            Connect Phantom Wallet
          </button>
        )}
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  card: {
    background: "#212133",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    width: "90%",
    maxWidth: "500px",
    zIndex: 1
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    fontSize: "14px"
  },
  buttonGreen: {
    marginTop: "1rem",
    padding: "10px 20px",
    background: "limegreen",
    color: "black",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  buttonRed: {
    marginTop: "1rem",
    padding: "10px 20px",
    background: "crimson",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  }
};

export default App;
