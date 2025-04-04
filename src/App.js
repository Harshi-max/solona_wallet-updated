import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  // Check if Phantom wallet is installed
  const isPhantomInstalled = () => {
    return window.solana && window.solana.isPhantom;
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (isPhantomInstalled()) {
        const response = await solana.connect();
        console.log("Connected with Public Key:", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Phantom wallet not found! Install it from https://phantom.app");
      }
    } catch (err) {
      console.error("Error connecting to wallet:", err);
    }
  };

  // Automatically connect if wallet is already connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (isPhantomInstalled()) {
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log("Connected with Public Key:", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
      }
    } catch (err) {
      console.error("No wallet connected yet");
    }
  };

  // Runs once when app loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Solana Phantom Wallet Connector</h1>

        {walletAddress ? (
          <div>
            <p>✅ Connected Wallet:</p>
            <code>{walletAddress}</code>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Phantom Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
