const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, Wallet, BN } = require('@project-serum/anchor');
const { SystemProgram, Keypair } = web3;


const listenToEvents = async () => {
    const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from([16,180,8,155,160,152,95,199,181,198,155,4,210,237,227,24,212,173,197,23,153,44,205,
        156,34,148,232,86,60,111,92,178,36,56,44,203,163,219,211,5,243,212,35,23,158,143,50,152,105,148,150,250
        ,197,227,186,59,154,22,137,23,108,63,83,131]));
    const wallet = new Wallet(walletKeyPair);
    
    let network = "http://127.0.0.1:8899";
    network ="https://api.mainnet-beta.solana.com";
    const connection = new Connection(network, "processed");

    const provider = new AnchorProvider(
      connection, wallet, "processed",
    );
    const orcaProgramId = new PublicKey("9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP");
    const mSolUSDT = new PublicKey("Afofkb7JTc32rdpqiyc3RDmGF5s9N6W1ujcdYVfGZ5Je");
    connection.onProgramAccountChange(orcaProgramId,(keyedAccountInfo, ctx) => {
        console.log(`[${new Date()}] Received.${keyedAccountInfo.accountId} / ${keyedAccountInfo.accountInfo.owner} / ${keyedAccountInfo.accountInfo.lamports}`);
    });
};

listenToEvents();