const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, Wallet, BN } = require('@project-serum/anchor');
const idl = require('../target/idl/hello_anchor.json');
const { SystemProgram, Keypair } = web3;

let baseAccount = Keypair.generate();
const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from([16,180,8,155,160,152,95,199,181,198,155,4,210,237,227,24,212,173,197,23,153,44,205,
    156,34,148,232,86,60,111,92,178,36,56,44,203,163,219,211,5,243,212,35,23,158,143,50,152,105,148,150,250
    ,197,227,186,59,154,22,137,23,108,63,83,131]));
const wallet = new Wallet(walletKeyPair);
console.log(`WalletPubKey=${walletKeyPair.publicKey}`);
console.log(`WalletSecretKey=${walletKeyPair.secretKey}`);
console.log(`BaseAccountPublicKey=${baseAccount.publicKey}`)
console.log(`BaseAccountSecretKey=${baseAccount.secretKey}`)


const listenToEvents = async () => {
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, "processed");

    const provider = new AnchorProvider(
      connection, wallet, "processed",
    );
    const programID = new PublicKey(idl.metadata.address);
    const program = new Program(idl, programID, provider);
    connection.onLogs("all", (log, ctx) => {
        console.log(log);
    });
};

listenToEvents();