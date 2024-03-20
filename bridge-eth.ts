import cli from "cli";
import { Contract, formatEther, Wallet } from "ethers";
import {
  DST_CHAIN_ID,
  GAS_MULTIPLICATOR,
  ROUTER_ABI,
  ROUTER_ADDRESS,
  ROUTER_ETH_ABI,
  ROUTER_ETH_ADDRESS,
  SLIPPAGE,
} from "./constants";
import { Network } from "./types";
import { getTxLink, providers } from "./utils";

export async function bridgeETH(
  key: string,
  fromNetwork: Network,
  toNetwork: Network,
  balance: bigint,
) {
  const provider = providers.get(fromNetwork)!;
  const wallet = new Wallet(key, provider);
  const dstChainId = DST_CHAIN_ID[toNetwork];
  const routerAddress = ROUTER_ADDRESS[fromNetwork];
  const routerContract = new Contract(routerAddress, ROUTER_ABI, wallet);
  const routerEthAddress = ROUTER_ETH_ADDRESS[fromNetwork];
  const routerEthContract = new Contract(
    routerEthAddress,
    ROUTER_ETH_ABI,
    wallet,
  );

  const fees = await routerContract.quoteLayerZeroFee(
    dstChainId,
    1,
    "0x0000000000000000000000000000000000000001",
    "0x",
    [0, 0, "0x0000000000000000000000000000000000000001"],
  );

  const [fee] = fees;

  const slippage = SLIPPAGE["0.5%"];
  let valueAndFee = balance;
  let amount = valueAndFee - fee;
  let minAmount = amount - (amount * slippage) / 1000n;

  let txArgs = [
    dstChainId,
    wallet.address,
    wallet.address,
    amount,
    minAmount,
  ];

  const gasLimit = await routerEthContract.swapETH.estimateGas(...txArgs, {
    value: valueAndFee,
  });

  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

  const gasCost = (maxFeePerGas! + maxFeePerGas! / 100n * GAS_MULTIPLICATOR) *
    gasLimit;
  valueAndFee = valueAndFee - gasCost;
  amount = amount - gasCost;
  minAmount = amount - (amount * slippage) / 1000n;

  txArgs = [
    dstChainId,
    wallet.address,
    wallet.address,
    amount,
    minAmount,
  ];

  const unsignedTx = await routerEthContract.swapETH.populateTransaction(
    ...txArgs,
    { value: valueAndFee },
  );

  console.log(`Wallet address: ${wallet.address}`);
  console.log(
    `Bridge ${formatEther(amount)} ETH ${fromNetwork} -> ${toNetwork}`,
  );
  console.log(`Total (include bridge fees): ${formatEther(valueAndFee)} ETH`);

  cli.spinner("Send transaction");
  const tx = await wallet.sendTransaction({
    ...unsignedTx,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
  });

  await provider.waitForTransaction(tx.hash);

  cli.spinner(getTxLink(fromNetwork, tx.hash), true);
  console.log(`https://layerzeroscan.com/tx/${tx.hash}`);
}
