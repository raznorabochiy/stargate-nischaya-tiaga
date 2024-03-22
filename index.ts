import cli from "cli";
import maxBy from "lodash/maxBy";
import random from "lodash/random";
import shuffle from "lodash/shuffle";
import { parseEther, Wallet } from "ethers";
import { bridgeETH } from "./bridge-eth";
import {
  DELAY_FROM_SEC,
  DELAY_TO_SEC,
  FROM_NETWORK,
  KEYS_FILENAME,
  MIN_ETH_TO_BRIDGE,
  SHUFFLE_KEYS,
  TO_NETWORK,
} from "./constants";
import { delayProgress, getBalance, loadFromFile } from "./utils";

let keys = await loadFromFile(KEYS_FILENAME);

if (SHUFFLE_KEYS) {
  keys = shuffle(keys);
}

const lastKey = [...keys].pop();

for (const key of keys) {
  const { address } = new Wallet(key);

  try {
    const nativeBalance = await Promise.all(
      FROM_NETWORK.map((network) => getBalance(network, address)),
    );

    const mappedNativeBalance = nativeBalance.map((balance, index) => {
      const network = FROM_NETWORK[index];

      return { network, balance };
    });

    const filteredNativeBalance = mappedNativeBalance.filter(
      (item) => item.balance > parseEther(MIN_ETH_TO_BRIDGE.toString()),
    );

    if (filteredNativeBalance.length === 0) {
      console.log("Нет исходящей сети с достаточным балансом");
      continue;
    }

    const max = maxBy(filteredNativeBalance, (item) => item.balance);
    const { network: fromNetwork, balance } = max!;

    const filteredToNetworks = TO_NETWORK.filter((item) =>
      item !== fromNetwork
    );

    if (filteredToNetworks.length === 0) {
      console.log("Нет подходящих сетей для бриджа");
      continue;
    }

    const [toNetwork] = shuffle(filteredToNetworks);

    await bridgeETH(key, fromNetwork, toNetwork, balance);
  } catch (e) {
    cli.spinner("", true);
    console.log("Error", e.message);
  }

  if (key !== lastKey) {
    const delayTimeout = random(DELAY_FROM_SEC, DELAY_TO_SEC);
    await delayProgress(delayTimeout);
  }
}
