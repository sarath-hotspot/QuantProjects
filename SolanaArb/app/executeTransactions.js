const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, Wallet, BN } = require('@project-serum/anchor');
const idl = require('../target/idl/hello_anchor.json');
const { SystemProgram, Keypair } = web3;

let baseAccount = Keypair.generate();
// baseAccount = Keypair.fromSecretKey(Uint8Array.from([239,205,116,69,80,224,106,198,110,229,147,199,128,137,67,105,128,111,130,180,99,
//     19,217,183,155,100,35,88,127,182,204,141,95,0,252,10,35,91,190,142,62,100,153,118,222,109,49,142,11,
//     126,147,86,64,142,33,209,231,19,251,223,38,250,107,137]));
const walletKeyPair = Keypair.fromSecretKey(Uint8Array.from([16,180,8,155,160,152,95,199,181,198,155,4,210,237,227,24,212,173,197,23,153,44,205,
    156,34,148,232,86,60,111,92,178,36,56,44,203,163,219,211,5,243,212,35,23,158,143,50,152,105,148,150,250
    ,197,227,186,59,154,22,137,23,108,63,83,131]));
const wallet = new Wallet(walletKeyPair);
console.log(`WalletPubKey=${walletKeyPair.publicKey}`);
console.log(`WalletSecretKey=${walletKeyPair.secretKey}`);
console.log(`BaseAccountPublicKey=${baseAccount.publicKey}`)
console.log(`BaseAccountSecretKey=${baseAccount.secretKey}`)

const executeCreate = async () => {
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, "processed");

    const provider = new AnchorProvider(
      connection, wallet, "processed",
    );
    const programID = new PublicKey(idl.metadata.address);
    const program = new Program(idl, programID, provider);
    await program.methods.create().accounts({
        baseAccount : baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
    }).signers([baseAccount]).rpc();
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('account: ', account);

    // Increment 
    await program.methods.increment()
        .accounts({
            baseAccount : baseAccount.publicKey,
        })
        .signers([walletKeyPair])
        .rpc();
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('account: ', account);
    await program.methods.incrementBy(new BN(100)).accounts(
        {
            baseAccount : baseAccount.publicKey,
        })
        .signers([walletKeyPair])
        .rpc();
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('account: ', account.count.toString(10));
};


executeCreate();