import { readFile } from "mz/fs";
import { Connection, Keypair } from "@solana/web3.js";
import { getOrca, OrcaFarmConfig, OrcaPoolConfig } from "@orca-so/sdk";
import Decimal from "decimal.js";

const main = async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");
  const orca = getOrca(connection);
  const orcaSolPool = orca.getPool(OrcaPoolConfig.SOL_USDC);
  const solToken = orcaSolPool.getTokenA();
  const solAmount = new Decimal(1.0);
  const quote = await orcaSolPool.getQuote(solToken, solAmount);
  const orcaAmount = quote.getMinOutputAmount();

    console.log(`Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} USDC`);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });
  