import { Presets, SingleBar } from "cli-progress";
import fs from "fs/promises";
import { JsonRpcProvider } from "ethers";
import { RPC_URL, TX_SCAN } from "./constants";
import { Network } from "./types";

const providers = new Map<Network, JsonRpcProvider>();

for (const [key, value] of Object.entries(RPC_URL)) {
  providers.set(key as Network, new JsonRpcProvider(value));
}

export { providers };

export async function getBalance(network: Network, address: string) {
  const provider = providers.get(network);
  const balance = await provider!.getBalance(address);

  return balance;
}

export const delay = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

export const delayProgress = (seconds: number) => {
  if (seconds === 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const bar = new SingleBar({
      format: "Delay [{bar}] {value}/{total}",
    }, Presets.shades_classic);

    bar.start(seconds, 0);
    let counter = 0;

    const timer = setInterval(() => {
      counter = counter + 1;
      bar.update(counter);
      if (counter === seconds) {
        clearInterval(timer);
        bar.stop();
        resolve();
      }
    }, 1000);
  });
};

export async function loadFromFile(fileName: string) {
  const file = await fs.readFile(fileName, { encoding: "utf-8" });

  return file.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function getTxLink(network: Network, txHash: string) {
  const url = TX_SCAN[network];
  return `${url}${txHash}`;
}
