import { ChangeEvent, useState } from "react";
import { ROUTER02 } from "../config/address";
import { UniswapV2Router02__factory } from "../typechain";
import { TokenData } from "../interfaces/data/token-data.interface";
import { provider } from "../utils/provider";
import {
  MaxUint256,
  ZeroAddress,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";
import { TokenDataList } from "../data/tokens";
import { TokenSelect } from "./TokenSelect";
import { useWalletClient } from "wagmi";
import { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";

export default function SwapNavigator() {
  const { data: client } = useWalletClient();
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [selectedInputToken, setSelectedInputToken] = useState<TokenData>();
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenData>();
  const [isInputNative, setIsInputNative] = useState<boolean>(false);

  const getAmountOut = async (
    path: `0x${string}`[],
    amountIn: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    const result: bigint[] = await router.getAmountsOut(amountIn, path);
    return result[result.length - 1];
  };

  const getAmountIn = async (
    path: `0x${string}`[],
    amountOut: bigint
  ): Promise<bigint> => {
    const router = UniswapV2Router02__factory.connect(ROUTER02, provider);
    const result: bigint[] = await router.getAmountsIn(amountOut, path);
    return result[0];
  };

  const handleSwap = async () => {
    const signer =
      client &&
      new JsonRpcSigner(
        new BrowserProvider(client.transport, {
          chainId: client.chain.id,
          name: client.chain.name,
          ensAddress: client.chain.contracts?.ensRegistry?.address,
        }),
        client.account.address
      );

    const router = UniswapV2Router02__factory.connect(ROUTER02, signer);
    if (isInputNative) {
      client &&
        (await router
          .swapExactETHForTokens(
            0,
            [
              selectedInputToken!.address === ZeroAddress
                ? (TokenDataList[137][1].address as `0x${string}`)
                : (selectedInputToken!.address as `0x${string}`),
              selectedOutputToken!.address === ZeroAddress
                ? (TokenDataList[137][1].address as `0x${string}`)
                : (selectedOutputToken!.address as `0x${string}`),
            ],
            client.account.address,
            MaxUint256,
            { value: parseEther(inputValue) }
          )
          .then((tx) => tx.wait()));
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setInputValue(event.target.value);

    if (selectedInputToken?.address && Number(event.target.value) !== 0) {
      if (selectedInputToken!.address === ZeroAddress) setIsInputNative(true);
      const amountOut = await getAmountOut(
        [
          selectedInputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedInputToken!.address as `0x${string}`),
          selectedOutputToken!.address === ZeroAddress
            ? (TokenDataList[137][1].address as `0x${string}`)
            : (selectedOutputToken!.address as `0x${string}`),
        ],
        parseUnits(event.target.value, selectedInputToken!.decimals)
      );
      setOutputValue(formatUnits(amountOut, selectedOutputToken!.decimals));
    } else {
      setOutputValue("0");
    }
  };

  const handleOutputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    selectedInputToken?.address && setOutputValue(event.target.value);
    if (selectedInputToken?.address && Number(event.target.value) !== 0) {
      const amountIn = await getAmountIn(
        [
          selectedInputToken!.address as `0x${string}`,
          selectedOutputToken!.address as `0x${string}`,
        ],
        parseUnits(event.target.value, selectedOutputToken!.decimals)
      );
      setInputValue(formatUnits(amountIn, selectedInputToken!.decimals));
    } else {
      setInputValue("0");
    }
  };

  const toggleTokens = () => {
    const tmpSelectedInputToken = selectedInputToken;
    const tmpInputValue = inputValue;
    setSelectedInputToken(selectedOutputToken);
    setSelectedOutputToken(tmpSelectedInputToken);
    setInputValue(outputValue);
    setOutputValue(tmpInputValue);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="0"
          value={inputValue}
          onChange={handleInputChange}
        />
        <TokenSelect
          setSelectedToken={setSelectedInputToken}
          selectedToken={selectedInputToken}
          blockSelectedToken={selectedOutputToken}
        />
      </div>
      <button type="button" onClick={toggleTokens}>
        switch
      </button>
      <div>
        <input
          type="text"
          placeholder="0"
          value={outputValue}
          onChange={handleOutputChange}
        />
      </div>
      <TokenSelect
        setSelectedToken={setSelectedOutputToken}
        selectedToken={selectedOutputToken}
        blockSelectedToken={selectedInputToken}
      />
      <button type="button" onClick={handleSwap}>
        swap
      </button>
    </div>
  );
}
