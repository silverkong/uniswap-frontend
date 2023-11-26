import { ethers } from "ethers";

export const signer = new ethers.AlchemyProvider(
  137,
  import.meta.env.VITE_ALCHEMY_API_KEY
).getSigner();
