import { TokenData } from "../interfaces/data/token-data.interface";
import { CoinIcon, CoinIconSize } from "./CoinIcon";
import { chainDataList } from "../data/chains";
import type { FC } from "react";

interface TokenIconProps {
  token: TokenData;
  size: CoinIconSize;
}

export const TokenIcon: FC<TokenIconProps> = ({ token, size }) => {
  if (!token) return null;
  const chain = chainDataList.find((c) => c.id === token.chainId)!;
  return (
    <div className="relative mr-1.5 rounded-full bg-white">
      <CoinIcon alt={token.symbol} imgSrc={token.logoURI} size={size} />
      <div className="absolute -right-1.5 -bottom-px">
        <CoinIcon
          className="z-10 bg-white"
          alt={chain.name}
          imgSrc={chain.logoURI}
          size={size === "xl" || size === "xxl" ? "md" : "sm"}
        />
      </div>
    </div>
  );
};
