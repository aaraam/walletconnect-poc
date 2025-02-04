<script setup>
import { ref, onMounted } from 'vue';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue';
import { ethers } from 'ethers';

let connected = ref(false);

// WalletConnect Project ID
const projectId = '59b8f4b8f8153ff97e652204f24f0442';

// Binance Smart Chain Configuration
const mainnet = {
	chainId: 97,
	name: 'Binance Smart Chain Testnet',
	currency: 'BNB',
	explorerUrl: 'https://testnet.bscscan.com',
	rpcUrl: 'https://bsc-testnet-dataseed.bnbchain.org',
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

// Reactive variables for the success dialog
const stakeSuccess = ref(false);
const stakeTxHash = ref("");

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

// Function to interact with the contract's stake() function
const stakeTokens = async () => {
	try {
		console.log('Attempting to stake tokens...');

		// Get the provider and signer from the modal
		const web3Provider = await modal.getWalletProvider();
		if (!web3Provider) {
			console.error('Web3Modal provider not found.');
			return;
		}
		const provider = new ethers.BrowserProvider(web3Provider);
		const signer = await provider.getSigner();

		// Contract details
		const contractAddress = '0x412b2e9E6c30486c537333Be85e09f767c367B6E';
		// Minimal ABI: the stake() function and the event (if needed)
		const abi = ['function stake() public', 'event Staked(address staker)'];

		// Instantiate the contract
		const contract = new ethers.Contract(contractAddress, abi, signer);

		// Call the stake function
		const tx = await contract.stake();
		console.log('Staking transaction submitted:', tx.hash);

		// Optionally wait for confirmation
		const receipt = await tx.wait();
		console.log('Staking transaction confirmed.');

		console.log('Receipt:', receipt);
		

		// Show the success dialog with tx hash
		stakeSuccess.value = true;
		stakeTxHash.value = receipt.hash;
		
	} catch (error) {
		console.error('Error staking tokens:', error);
	}
};

// Function to close the success dialog
const closeDialog = () => {
	stakeSuccess.value = false;
	stakeTxHash.value = "";
};

// Initialize Web3Modal in onMounted()
onMounted(async () => {
	console.log('Initializing Web3Modal...');

	const ethersConfig = defaultConfig({
		metadata,
		enableEIP6963: true,
		enableInjected: true,
		enableCoinbase: true,
		rpcUrl: 'https://bsc-testnet-dataseed.bnbchain.org',
		defaultChainId: 97,
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

	// **Immediate check: display console if the user is already connected on initial load**
	try {
		console.log('Checking for pre-existing wallet connection...');

		const web3Provider = await modal.getWalletProvider();
		console.log({ web3Provider });

		if (web3Provider) {
			console.log('Web3Provider found:', web3Provider);

			const provider = new ethers.BrowserProvider(web3Provider);
			const signer = await provider.getSigner();
			walletAddress.value = await signer.getAddress();
			console.log(
				'User is already connected on initial load:',
				walletAddress.value
			);
		}
		console.log('Pre-existing wallet connection check completed.');
	} catch (error) {
		// If there is no connection yet, getWalletProvider might throw or return null.
		console.error(
			'No pre-existing wallet connection found or error occurred:',
			error
		);
	}

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
			Connected: {{ walletAddress.slice(0, 6) }}...{{
				walletAddress.slice(-4)
			}}
		</div>

		<!-- Connect Wallet Button -->
		<button @click="connectWallet">
			{{ connected ? 'Wallet Connected' : 'Connect Wallet' }}
		</button>

		<!-- Stake Button: only visible when the wallet is connected -->
		<button v-if="connected" @click="stakeTokens" id="stakeBtn">Stake</button>

		<div v-if="stakeSuccess" class="dialog-box">
			<p>Transaction confirmed!</p>
			<a :href="`https://testnet.bscscan.com/tx/${stakeTxHash}`" target="_blank">
				View on BscScan
			</a>
			<button @click="closeDialog">Close</button>
		</div>
	</div>
</template>

<style>
.container {
	display: flex;
	flex-direction: column; /* Stacks buttons vertically */
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

button {
	margin: 10px;
	padding: 10px 20px;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	cursor: pointer;
}

.stakeBtn {
	font-size: 16px;
	cursor: pointer;
}
</style>
