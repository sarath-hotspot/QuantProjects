import * as assert from "assert";
import * as anchor from "@project-serum/anchor";
import { Program, web3, AnchorProvider } from "@project-serum/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";
const { SystemProgram, Keypair } = anchor.web3;
import * as solanaWeb3 from "@solana/web3.js";
import { PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as spl from "../node_modules/@solana/spl-token";
import { struct, u8 } from '@solana/buffer-layout';
import { u64 } from '@solana/buffer-layout-utils';
import { Environment } from "@port.finance/port-sdk"
import { getOrca, OrcaFarmConfig, OrcaPoolConfig } from "@orca-so/sdk";
import Decimal from "decimal.js";

// import * as pf from "@port.finance/port-sdk";
import { getOrCreateAssociatedTokenAccount } from "../node_modules/@solana/spl-token";

describe("hello-anchor", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const counter = anchor.web3.Keypair.generate();

  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;
  
  // const receiverProgramId = new PublicKey("93wTDro7hH46fq8EkZMvyf6xNahHPngbJFr5zNtnwELQ"); 
  const receiverProgramId = program.programId;

  const pfMainNetEnv = Environment.forMainNet();
  const pfAssetConfig = pfMainNetEnv.getAssetContext().findConfigBySymbol("SOL");  

  it("Invoke port finance!", async () => {
  
    // Create a payer with some SOL balance.
    const payer = Keypair.generate(); 
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 5* LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);    
    let balance = await connection.getBalance(payer.publicKey);
    console.log(`Balance=${balance}`);
    
    /////////////////////////////////////////////////////////////////////////////////
    const associatedTokenAccount = await spl.getAssociatedTokenAddress(
      spl.NATIVE_MINT,
      payer.publicKey
    );
    const ataTransaction = new Transaction()
    .add(spl.createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAccount,
        payer.publicKey,
        spl.NATIVE_MINT
      )
    );  
    await sendAndConfirmTransaction(connection, ataTransaction, [payer]);
    console.log(`Associated TokenAccount created=${associatedTokenAccount}`);

    /////////////////////////////////////////////////////////////////////////////////
        
    

        // Exchange SOL to USDC.
        // const orca = getOrca(connection);
        // const orcaSolPool = orca.getPool(OrcaPoolConfig.SOL_USDC);
        // const solToken = orcaSolPool.getTokenA();
        // const solAmount = new Decimal(1.0);
        // const quote = await orcaSolPool.getQuote(solToken, solAmount);
        // console.log("5");
        // const usdcAmount = quote.getMinOutputAmount();
        // console.log(`1 SOL to X USDC = ${usdcAmount.toNumber()}`);

        // const swapPayload = await orcaSolPool.swap(payer, solToken, new Decimal(0.5), usdcAmount);
        // const swapTxId = await swapPayload.execute();
        // console.log("Swapped:", swapTxId, "\n");

    const portFinanceProgramId = "Port7uDYB3wk6GJAw4KT1WpTeMtSu9bTcChBHkX2LfR";
    const recentBlockhash = await provider.connection.getLatestBlockhash();
    const txn = new solanaWeb3.Transaction({recentBlockhash: recentBlockhash.blockhash});

    const USDCMintToken = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const USDCLiquiditySupplyId = new PublicKey("2xPnqU4bWhUSjZ74CibY63NrtkHHw5eKntsxf8dzwiid");
    const USDCReserveId = new PublicKey("DcENuKuYd6BWGhKfGr7eARxodqG12Bz1sN5WA8NwvLRx");
    const USDCReserveLiquidityFeeReceiver= new PublicKey("2pb9va1fRPzvgxj5w2P2Sqq2a5SQpWMbBD5fMYTNSifp");

    const SOLMintToken = new PublicKey("So11111111111111111111111111111111111111112");
    const SOLLiquiditySupplyId = new PublicKey("BLAFX12cDmsumyB6k3L6whJZqNqySaWeCmS5rVuzy3SS");
    const SOLReserveId = new PublicKey("X9ByyhmtQH3Wjku9N5obPy54DbVjZV7Z99TPJZ2rwcs");
    const SOLReserveLiquidityFeeReceiver= new PublicKey("GavAqyCFbgKXQzRNqPv1sr95shGcW7cSqLBK5Gd8r7zd");

    const MintToken = SOLMintToken;
    const LiquiditySypplyId = SOLLiquiditySupplyId;
    const ReserveId = SOLReserveId;
    const ReserveLiquidityFeeReceiver = SOLReserveLiquidityFeeReceiver;

    const pfLendingMarket = new PublicKey("6T4XxKerq744sSuj3jaoV6QiZ8acirf4TrPwQzHAoSy5");
    const pfLendingMarketAuthority = new PublicKey("8x2uay8UgrLiX8AAYyF6AkK9z91nNtN6aLwfqPkf6TAQ");
    const tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

    // Create PDA address owned by program.
    // Create account which receives USDC.
    const [program_owned_address, bump_seed] = 
      PublicKey.findProgramAddressSync(
        [Buffer.from("flashloan")],
        receiverProgramId);
    console.log(`PDA=${program_owned_address} Seed=${bump_seed}`);

    // Create associated token account ccorresponding to PDA.    
    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      MintToken,
      program_owned_address,
      true
    );
    const receiverPublicKey = receiverTokenAccount.address;
    console.log(`AssociatedTokenAccount=${receiverPublicKey}`);
   
    /////////////////////////////////////////////////////////////////////////////////
  // Transfer SOL to associated token account and use SyncNative to update wrapped SOL balance
  const solTransferTransaction = new Transaction()
    .add(
      SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: receiverPublicKey,
          lamports: LAMPORTS_PER_SOL
        }),
        spl.createSyncNativeInstruction(
          receiverPublicKey
      )
    )

  await sendAndConfirmTransaction(connection, solTransferTransaction, [payer]);
  const accountInfo = await spl.getAccount(connection, receiverPublicKey);
  console.log(`Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`); 
    /////////////////////////////////////////////////////////////////////////////////

    // Create data stream.
    interface Data {
      instruction: number;
      liquidityAmount: bigint;
    }
    const DataLayout = struct<Data>([u8('instruction'), u64('liquidityAmount')]);
    const data = Buffer.alloc(DataLayout.span);
    DataLayout.encode(
        {
            instruction: 13,
            liquidityAmount: BigInt(100000),
        },
        data
    );

    txn.add(new solanaWeb3.TransactionInstruction({
      programId: new solanaWeb3.PublicKey(portFinanceProgramId),
      keys : [
        {
          pubkey: LiquiditySypplyId,
          isSigner: false,
          isWritable: true
        },
        {
          // Destination address.
          pubkey: new PublicKey(receiverPublicKey),
          isSigner: false,
          isWritable: true
        },
        {
          // Reserve id
          pubkey: ReserveId,
          isSigner: false,
          isWritable: true
        },
        {
          // fee receiver.
          pubkey: ReserveLiquidityFeeReceiver,
          //pubkey: new PublicKey(programOwnedAddress.publicKey),
          isSigner: false,
          isWritable: true
        },
        {
          // host fee receiver.
          pubkey: receiverPublicKey,
          isSigner: false,
          isWritable: true
        },
        {
          // Lending market
          pubkey: pfLendingMarket,
          isSigner: false,
          isWritable: false
        },
        {
          // Lending market authority
          pubkey: pfLendingMarketAuthority,
          isSigner: false,
          isWritable: false
        },
        {
          // Token program id.
          pubkey: new PublicKey(spl.TOKEN_PROGRAM_ID),
          isSigner: false,
          isWritable: false
        },
        {
          // Receiver program id.
          pubkey: receiverProgramId,
          isSigner: false,
          isWritable: false
        },
        {
          // FROM HERE CUSTOM ACCOUNTS WE ARE PASSING
          // PDA owned by program. program_owned_address
          pubkey: program_owned_address,
          isSigner: false,
          isWritable: false
        },
        {
          // Mint token 
          pubkey: MintToken,
          isSigner: false,
          isWritable: false
        }
      ],
      data : data
    }));
    
    
    try {
      const txnSignature = await provider.sendAndConfirm(txn);
      console.log(`Invoke Port Finance Txn=${txnSignature}`);  
    }
    catch(e) {
      console.log("Error");
      console.log(e);
      console.log(e.logs);
    }
  });

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initialize().rpc();  
  //   console.log("Your initialize transaction signature", tx);
  // });

  // it("Create!", async () => {
  //   const tx = await program.methods.create().accounts({
  //     baseAccount : counter.publicKey,
  //     user: provider.wallet.publicKey,
  //     systemProgram: SystemProgram.programId
  //   })
  //   .signers([counter])
  //   .rpc();
  //   console.log(`Your create txn=${tx}`);

  //   let counterAccount = await program.account.baseAccount.fetch(counter.publicKey);
  //   assert.ok(counterAccount.count.toNumber() === 0);
  // });

  // it("Simulate increment!", async () => {
  //   const simulateResponse = await program.methods.increment().accounts({
  //     baseAccount : counter.publicKey
  //   })
  //   .simulate();

  //   console.log(`SimulateResponse=${simulateResponse.raw}`);
  // });

  // it("Increment!", async () => {
  //   const tx = await program.methods.increment().accounts({
  //     baseAccount : counter.publicKey
  //   })
  //   .rpc();
  //   console.log(`Your increment txn=${tx}`);

  //   let counterAccount = await program.account.baseAccount.fetch(counter.publicKey);
  //   assert.ok(counterAccount.count.toNumber() === 1);
  // });

  // it("Check fallback!", async () => {
  //   const recentBlockhash = await provider.connection.getLatestBlockhash();
  //   const txn = new solanaWeb3.Transaction({recentBlockhash: recentBlockhash.blockhash});
  //   txn.add(new solanaWeb3.TransactionInstruction({
  //     programId: new solanaWeb3.PublicKey("93wTDro7hH46fq8EkZMvyf6xNahHPngbJFr5zNtnwELQ"),
  //     keys : [],
  //     data : Buffer.from("")
  //   }));
  //   const txnSignature = await provider.sendAndConfirm(txn);
  //   console.log(`Fallback Txn=${txnSignature}`);
  // });
});
