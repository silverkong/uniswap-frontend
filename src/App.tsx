import "./App.css";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { polygon } from "viem/chains";
import { walletConnectProvider } from "@web3modal/wagmi";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { alchemyProvider } from "wagmi/providers/alchemy";

///////////////////////
// import components //
///////////////////////
import ConnectWallet from "./components/ConnectWallet";
import Portfolio from "./components/Portfolio";
import SwapNavigator from "./components/SwapNavigator";

// alchemy api key, projectId
const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
const projectId = import.meta.env.VITE_PROJECT_ID;

// Create wagmiConfig
const { chains, publicClient } = configureChains(
  [polygon],
  [
    walletConnectProvider({ projectId }),
    publicProvider(),
    alchemyProvider(apiKey),
  ]
);

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: { projectId, showQrModal: false, metadata },
    }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
  ],
  publicClient,
});

// Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectWallet />
      <Portfolio />
      <SwapNavigator />
    </WagmiConfig>
  );
}

export default App;
