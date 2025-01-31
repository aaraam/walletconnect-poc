<script setup lang="ts">
  import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'

  // 1. Get projectId from https://cloud.walletconnect.com
  const projectId = '59b8f4b8f8153ff97e652204f24f0442'

  // 2. Set chains
  const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
  }

  // 3. Create your application's metadata object
  const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://mywebsite.com', // url must match your domain & subdomain
    icons: ['https://avatars.mywebsite.com/']
  }

  // 4. Create Ethers config
  const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: 'https://56.rpc.thirdweb.com/66c5a792422842671ed5c3047791f5b8',// used for the Coinbase SDK
    defaultChainId: 1, // used for the Coinbase SDK
  })

  // 5. Create a Web3Modal instance
  const modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    enableOnramp: true // Optional - false as default
  })
</script>

<template> 
  <button @click="modal.open()">Connect Wallet</button>
  <!-- <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button> -->
</template>