import { useState, useEffect } from "react";
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { TokenIcon } from "./TokenIcon";
import { TokenData } from "../interfaces/data/token-data.interface";
import { ERC20__factory, Multicall2, Multicall2__factory } from "../typechain";
import { MULTICALL } from "../config/address";
import { provider } from "../utils/provider";
import { ZeroAddress, formatUnits } from "ethers";
import { TokenDataList } from "../data/tokens";

const getTokenBalance = async (
  tokens: TokenData[],
  user: `0x${string}`
): Promise<{ blockNumber: bigint; returnData: string[] }> => {
  const multicall = Multicall2__factory.connect(MULTICALL, provider);
  const tokenItf = ERC20__factory.createInterface();
  const data: Multicall2.CallStruct[] = [];
  tokens.map((token) => {
    if (token.address !== ZeroAddress) {
      data.push({
        target: token.address,
        callData: tokenItf.encodeFunctionData("balanceOf", [user]),
      });
    }
  });
  return multicall.aggregate(data);
};

export default function Portfolio() {
  const { address: user } = useAccount();
  const { data: balance } = useBalance({ address: user, chainId: 137 });
  const { chain: currentChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  // 해당 체인의 토큰 리스트를 ../data/tokens.ts에서 가져옴
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [tokenBalance, setTokenBalance] = useState<string[]>([]);
  const getBalanceList = async () => {
    if (currentChain && user) {
      const tokenBalances = (
        await getTokenBalance(TokenDataList[currentChain.id], user)
      ).returnData;
      setTokenList(TokenDataList[currentChain.id]);
      setTokenBalance(tokenBalances);
    }
  };

  useEffect(() => {
    switchNetwork?.(137);
    getBalanceList();
  }, [currentChain, user]);

  return user ? (
    <div>
      {tokenList.map((token, i) => {
        if (balance && i === 0) {
          // Native Token
          return (
            <div key={i}>
              <TokenIcon token={token} size="md" />
              <div>{formatUnits(balance!.value, 18)}</div>
            </div>
          );
        } else if (BigInt(tokenBalance[i - 1]) > 0n) {
          return (
            <div key={i}>
              <TokenIcon token={token} size="md" />
              <div>{formatUnits(tokenBalance[i - 1], token.decimals)}</div>
            </div>
          );
        }
      })}
    </div>
  ) : (
    <div>Connect Wallet</div>
  );
}
