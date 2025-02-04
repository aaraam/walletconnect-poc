<script setup>
import { ref, onMounted } from 'vue';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue';
import { ethers } from 'ethers';

let connected = ref(false);

// WalletConnect Project ID
const projectId = '59b8f4b8f8153ff97e652204f24f0442';

// Binance Smart Chain Configuration
const mainnet = {
  chainId: 56,
  name: 'Binance Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://56.rpc.thirdweb.com/66c5a792422842671ed5c3047791f5b8',
};

// Application Metadata
const metadata = {
  name: 'WalletConnect POC',
  description: 'WalletConnect POC',
  url: 'https://aaraam.is-a.dev/walletconnect-poc/',
  icons: ['https://avatars.mywebsite.com/'],
};

// **Reactive Wallet Address**
const walletAddress = ref(null);
let modal = null; // Web3Modal instance (initialized in onMounted)

// Function to connect wallet properly
const connectWallet = async () => {
  try {
    console.log('Opening WalletConnect modal...');
    
    if (!modal) {
      console.error('Web3Modal not initialized!');
      return;
    }

    // Open Web3Modal
    await modal.open();

    console.log('Web3Modal opened! Waiting for provider...');

    // Fetch the correct Web3Modal provider (DO NOT use window.ethereum directly)
    const web3Provider = await modal.getWalletProvider();
    
    if (!web3Provider) {
      console.error('Web3Modal provider not found.');
      return;
    }

    const provider = new ethers.BrowserProvider(web3Provider);
    const signer = await provider.getSigner();
    walletAddress.value = await signer.getAddress();
	connected.value = true;
    
    console.log('Connected wallet:', walletAddress.value);
  } catch (error) {
    console.error('Wallet connection failed:', error);
  }
};

// Initialize Web3Modal in onMounted()
onMounted(() => {
  console.log('Initializing Web3Modal...');

  const ethersConfig = defaultConfig({
    metadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: 'https://56.rpc.thirdweb.com/66c5a792422842671ed5c3047791f5b8',
    defaultChainId: 56,
  });

  modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
  });

  console.log('Web3Modal initialized:', modal);

  // **Detect when the wallet is connected**
  modal.subscribeState(async (state) => {
    console.log('Web3Modal state changed:', state);

    if (state.connected) {
      const web3Provider = await modal.getWalletProvider();
      if (!web3Provider) {
        console.error('Web3Modal provider not found.');
        return;
      }

      const provider = new ethers.BrowserProvider(web3Provider);
      const signer = await provider.getSigner();
      walletAddress.value = await signer.getAddress();
      console.log('Wallet connected:', walletAddress.value);
    }
  });

  // **Detect account changes**
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
      walletAddress.value = accounts.length > 0 ? accounts[0] : null;
      console.log('Account changed:', walletAddress.value);
    });
  }
});
</script>

<template>
  <div class="container">
    <!-- Wallet Address Display -->
    <div v-if="walletAddress" class="wallet-info">
      Connected: {{ walletAddress.slice(0, 6) }}...{{ walletAddress.slice(-4) }}
    </div>

    <!-- Connect Wallet Button -->
	<button @click="connectWallet">
	  {{ connected ? 'Wallet Connected' : 'Connect Wallet' }}
	</button>
  </div>
</template>

<style>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.wallet-info {
  position: absolute;
  top: 10px;
  right: 20px;
  background: #282c34;
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
}
</style>
