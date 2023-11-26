import { ChangeEvent, useEffect, useState } from "react";
import { useNetwork } from "wagmi";
import { TokenData } from "../interfaces/data/token-data.interface";
import { TokenDataList } from "../data/tokens";

export function TokenSelect({
  setSelectedToken,
  selectedToken,
  blockSelectedToken,
}: {
  setSelectedToken: (token: TokenData) => void;
  selectedToken: TokenData | undefined;
  blockSelectedToken: TokenData | undefined;
}) {
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const { chain: currentChain } = useNetwork();
  const handleTokenChange = (event: ChangeEvent<HTMLSelectElement>) => {
    tokenList.map((token) => {
      if (token.symbol === event.target.value) setSelectedToken(token);
    });
  };

  useEffect(() => {
    if (currentChain) setTokenList(TokenDataList[currentChain.id]);
  }, []);

  return (
    <select value={selectedToken?.symbol || ""} onChange={handleTokenChange}>
      <option value="" key="">
        Select a token
      </option>
      {tokenList.map((token, tokenIndex) =>
        blockSelectedToken &&
        token.address === blockSelectedToken.address ? null : (
          <option key={tokenIndex} value={token.symbol}>
            {token.symbol}
          </option>
        )
      )}
    </select>
  );
}
