// src/walletKit.js
import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';

const projectId = '59b8f4b8f8153ff97e652204f24f0442'; // Replace with your WalletConnect Project ID

const core = new Core({
  projectId,
});

const walletKit = await WalletKit.init({
  core,
  metadata: {
    name: 'My Wallet',
    description: 'A simple wallet app using WalletKit',
    url: 'https://yourapp.com',
    icons: [], // Add your wallet's icon URLs
  },
});

export default walletKit;
