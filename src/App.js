import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';
import SimpleWallet from './contracts/SimpleWallet.json'

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [currentNetwork, setCurrentNetwork] = useState('');


  useEffect(() => {
    const storedAccount = localStorage.getItem('connectedAccount');
    if (storedAccount) {
      setAccount(storedAccount);
    }
    async function init() {
      if (account) {
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = SimpleWallet.networks[networkId];
        // Get the current network
        const network = await web3.eth.net.getNetwork(networkId);
        setCurrentNetwork(network);

        if (deployedNetwork) {
          const contract = new web3.eth.Contract(
              SimpleWallet.abi,
              deployedNetwork.address
          );
          setContract(contract);
          try {
            const userBalance = await contract.methods.getBalance().call({ from: account });
            setBalance(userBalance);
          } catch (error) {
            console.error(error);
            setBalance(0);
          }
        }
        setWeb3(web3);
      }
    }
    init();
  }, [account]);


  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(accounts[0]);

        // Save connected wallet data to localStorage
        localStorage.setItem('connectedAccount', accounts[0]);

      } else {
        console.error('MetaMask is not installed or not accessible.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const switchToBSC = async () => {
    if (!web3) return;

    try {
      // Request switch to BSC network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x539', // BSC Mainnet chain ID
            chainName: 'Localhost Chain',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['http://localhost:8545'], // URL of your local blockchain
          },
        ],
      });

      // Refresh the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount(null);
    setContract(null);
    setBalance(0);
    localStorage.removeItem('connectedAccount');
  };

  const depositEther = async () => {
    try {
      await contract.methods.deposit().send({ from: account, value: web3.utils.toWei('0.1', 'ether') });
      const userBalance = await contract.methods.getBalance().call({ from: account });
      setBalance(userBalance);
    } catch (error) {
      console.error(error);
    }
  };

  const withdrawEther = async () => {
    try {
      await contract.methods.withdraw(web3.utils.toWei('0.1', 'ether')).send({ from: account });
      const userBalance = await contract.methods.getBalance().call({ from: account });
      setBalance(userBalance);
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <div className="App">
        {account ? (
            <div>
              <button onClick={disconnectWallet}>Disconnect Wallet</button>
              <button onClick={switchToBSC}>Switch to Chain</button>
              <p>Connected Account: {account}</p>
              <p>Balance: {web3 ? web3.utils.fromWei(balance, 'ether') : 'Loading...'} ETH</p>
              <button onClick={depositEther}>Deposit</button>
              <button onClick={withdrawEther}>Withdraw</button>
            </div>
        ) : (
            <button onClick={connectWallet}>
              {account ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
        )}
      </div>
  );
}

export default App;
