import cli from "cli";
import maxBy from "lodash/maxBy";
import random from "lodash/random";
import shuffle from "lodash/shuffle";
import { Wallet } from "ethers";
import { bridgeETH } from "./bridge-eth";
import {
  DELAY_FROM_SEC,
  DELAY_TO_SEC,
  FROM_NETWORK,
  KEYS_FILENAME,
  SHUFFLE_KEYS,
  TO_NETWORK,
} from "./constants";
import { delayProgress, getBalance, loadFromFile } from "./utils";

let keys = await loadFromFile(KEYS_FILENAME);

if (SHUFFLE_KEYS) {
  keys = shuffle(keys);
}

const lastKey = [...keys].pop();

if (FROM_NETWORK.includes(TO_NETWORK)) {
  throw new Error("Список FROM_NETWORK не должен содержать сеть из TO_NETWORK");
}

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
      (item) => item.balance > 0,
    );

    if (filteredNativeBalance.length === 0) {
      console.log("Нет исходящей сети с достаточным балансом");
      continue;
    }

    const max = maxBy(filteredNativeBalance, (item) => item.balance);
    const { network, balance } = max!;

    await bridgeETH(key, network, TO_NETWORK, balance);
  } catch (e) {
    cli.spinner("", true);
    console.log("Error", e.message);
  }

  if (key !== lastKey) {
    const delayTimeout = random(DELAY_FROM_SEC, DELAY_TO_SEC);
    await delayProgress(delayTimeout);
  }
}
