
// const portSdk = require("@port.finance/port-sdk");
// const {TOKEN_PROGRAM_ID} = require("@solana/spl-token");
import * as portSdk from "@port.finance/port-sdk";
import { TOKEN_PROGRAM_ID  } from "@solana/spl-token";

const main = async () => {
    const port = portSdk.Port.forMainNet({});
    const env = port.getEnvironment();
    
    for(var config of env.getAssetContext().getAllConfigs()) {
        const symbol = config.getSymbol();
        if (symbol != "SOL")
        {
            continue;
        }
        const reserverId = config.getReserveId();
        if (reserverId == undefined)
        {
            continue;
        }
        const reserve = await port.getReserve(reserverId);
        const fees = reserve.proto.config.fees;
        console.log(`${symbol}=${fees.flashLoanFeeWad}/${fees.hostFeePercentage}`);
        const liquiditySupplyId = reserve.proto.liquidity.supplyPubkey;
        console.log(`0. Symbol=${symbol} MintId=${config.getMintId()}`);
        console.log(`1. LiquiditySupplyId=${liquiditySupplyId}`);
        // TODO: 2. find program owned token account.
        console.log(`3. ReserveId=${reserverId}`);
        console.log(`4. ReserveLiquidityFeeReceiver=${reserve.getFeeBalanceId()}`);
        // TODO: 5. host fee account.
        console.log(`6. LendingMarket=${port.lendingMarket}`);
        
        // const [lendingMarketAuthority, _] = PublicKey.findProgramAddressSync(
        //     [port.lendingMarket.toBuffer()],
        //     portSdk.PORT_LENDING);
        const [lendingMarketAuthority, _] = await port.getLendingMarketAuthority();
        console.log(`7. LendingMarkeyAuthority=${lendingMarketAuthority}`);
        console.log(`8. TokenProgramId=${TOKEN_PROGRAM_ID}`);
        console.log("9. Received ProgramId=");
    }
}

main().then(() => {console.log("Done");});



