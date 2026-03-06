const web3 = require("@solana/web3.js");
const {
    Keypair,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl,
    sendAndConfirmTransaction
  } = require("@solana/web3.js");

const anchor= require('@project-serum/anchor');
const {AnchorProvider } = require('@project-serum/anchor');
const { Program } = require('@project-serum/anchor');
const { HelloAnchor } = require('../target/idl/hello_anchor.json');

let connection = new Connection("http://localhost:8899", "confirmed");

let wallet = Keypair.generate();
wallet = Keypair.fromSecretKey(Uint8Array.from([18,4,244,113,177,215,203,155,160,28,35,118,204,134,129,37,206,17,112,245,207,194,53,249,73,
      24,198,128,37,182,16,223,82,154,236,34,109,27,183,140,42,20,167,208,193,145,231,197,86,97,216,3,186,
      140,99,158,10,219,35,226,90,221,222,126]));
console.log(`PubKey=${wallet.publicKey}`);
console.log(`SecretKey=${wallet.secretKey}`);
    
const createWalletAndAirDrop = async () =>  {
    let toWallet = Keypair.generate();
    console.log(`WalletPublicKey=${toWallet.publicKey}`)
    console.log(`WalletSecretKey=${toWallet.secretKey}`)

    const airdropSignature = await connection.requestAirdrop(toWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);

    let balance = await connection.getBalance(toWallet.publicKey);
    console.log(`Balance=${balance}`)
};

const test = async () => {

    // connection.onAccountChange(
    //     wallet.publicKey,
    //     (updatedAccountInfo, context) =>
    //       console.log("Updated account info: ", updatedAccountInfo),
    //     "confirmed"
    //   );

    // const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    // await connection.confirmTransaction(airdropSignature);
    
    // Transfer to second account. 
    let toWallet = Keypair.generate();
    console.log(`To wallet=${toWallet.publicKey}`)
    const recentBlockhash = await connection.getLatestBlockhash();
    const transferTransaction = new Transaction({
        recentBlockhash: recentBlockhash
    }).add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: toWallet.publicKey,
            lamports : 10
        })
    );
    transferTransaction.feePayer = wallet.publicKey;
    const fees = await transferTransaction.getEstimatedFee(connection);
    console.log(`Estimated SOL transfer cost: ${fees} lamports`);
    // await sendAndConfirmTransaction(connection, transferTransaction, [wallet]);
}

const executeContract = async () => { 

    let tx = new Transaction().add(
        new web3.TransactionInstruction({
            programId: "93wTDro7hH46fq8EkZMvyf6xNahHPngbJFr5zNtnwELQ",
        })
    );
    sendAndConfirmTransaction(connection, tx, [wallet]);
    
};

createWalletAndAirDrop();