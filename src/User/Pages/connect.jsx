import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
// import { bsc } from '@reown/appkit/networks';
import { bscTestnet, bsc } from '@reown/appkit/networks';

const projectId = '920dae0152ca91d124e083f6a74a94b6';

const networks = [bscTestnet, bsc];

const metadata = {
  name: 'MOX',
  description: 'MOX Presale',
  url: 'https://mox.co' || 'http://localhost:5173',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  defaultOpen: false,
  allowAutoConnect: false,
  features: {
    analytics: true 
  }
})

export default createAppKit;