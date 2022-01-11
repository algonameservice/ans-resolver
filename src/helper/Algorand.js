const algosdk = require('algosdk')
require('dotenv').config()

const client = new algosdk.Algodv2({ 'X-API-KEY': process.env.PURESTAKE_API_KEY },
            process.env.PURESTAKE_CLIENT_URL,
            '');

const indexer = new algosdk.Indexer({ 'X-API-KEY': process.env.PURESTAKE_API_KEY },
            process.env.PURESTAKE_INDEXER_URL,
            '');  

const Algorand = {

    generateTeal : (name) => {
        
        const tealCode = `
        #pragma version 3
        byte "${name}"
        len
        int 3
        ==
        bnz main_l6
        byte "${name}"
        len
        int 4
        ==
        bnz main_l5
        byte "${name}"
        len
        int 5
        >=
        bnz main_l4
        err
        main_l4:
        gtxn 0 Amount
        int 32000000
        >=
        assert
        global GroupSize
        int 5
        ==
        gtxn 0 Receiver
        addr U3GZ7TNYIHWBZK45PAJZFYXQAPJDTKRBMYZH4ZBCWZQ63NNSQKCZU56IF4
        ==
        &&
        gtxn 1 Sender
        gtxn 0 Sender
        ==
        &&
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        &&
        gtxn 2 ApplicationID
        int 56907092
        ==
        &&
        gtxn 3 RekeyTo
        gtxn 0 Sender
        ==
        &&
        gtxn 3 Sender
        gtxn 2 Sender
        ==
        &&
        gtxn 4 ApplicationID
        int 56907092
        ==
        &&
        gtxn 4 Sender
        gtxn 0 Sender
        ==
        &&
        assert
        int 1
        b main_l7
        main_l5:
        gtxn 0 Amount
        int 125000000
        >=
        assert
        global GroupSize
        int 5
        ==
        gtxn 0 Receiver
        addr U3GZ7TNYIHWBZK45PAJZFYXQAPJDTKRBMYZH4ZBCWZQ63NNSQKCZU56IF4
        ==
        &&
        gtxn 1 Sender
        gtxn 0 Sender
        ==
        &&
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        &&
        gtxn 2 ApplicationID
        int 56907092
        ==
        &&
        gtxn 3 RekeyTo
        gtxn 0 Sender
        ==
        &&
        gtxn 3 Sender
        gtxn 2 Sender
        ==
        &&
        gtxn 4 ApplicationID
        int 56907092
        ==
        &&
        gtxn 4 Sender
        gtxn 0 Sender
        ==
        &&
        assert
        int 1
        b main_l7
        main_l6:
        gtxn 0 Amount
        int 313000000
        >=
        assert
        global GroupSize
        int 5
        ==
        gtxn 0 Receiver
        addr U3GZ7TNYIHWBZK45PAJZFYXQAPJDTKRBMYZH4ZBCWZQ63NNSQKCZU56IF4
        ==
        &&
        gtxn 1 Sender
        gtxn 0 Sender
        ==
        &&
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        &&
        gtxn 2 ApplicationID
        int 56907092
        ==
        &&
        gtxn 3 RekeyTo
        gtxn 0 Sender
        ==
        &&
        gtxn 3 Sender
        gtxn 2 Sender
        ==
        &&
        gtxn 4 ApplicationID
        int 56907092
        ==
        &&
        gtxn 4 Sender
        gtxn 0 Sender
        ==
        &&
        assert
        int 1
        main_l7:
        return`

        return tealCode;
    },

    generateLsig: async (name) => {
        
        let program = await client.compile(Algorand.generateTeal(name)).do();
        program = new Uint8Array(Buffer.from(program.result, "base64"));
        
        const lsig = algosdk.makeLogicSig(program);
        
        return lsig;
        
    },

    searchForName : async (name) => {
        
        const lsig = await Algorand.generateLsig(name);

        try {
            let accountInfo = await indexer.lookupAccountByID(lsig.address()).do();
            
            accountInfo = accountInfo.account['apps-local-state'];
            
            const length = accountInfo.length;
            for (let i = 0; i < length; i++) {
                let app = accountInfo[i];
                
                if (app.id === parseInt(process.env.APP_ID)) {

                    let kv = app['key-value'];

                    let kvLength = kv.length;
                    let owner;
                    let data = [];

                    
                    for (let j = 0; j < kvLength; j++) {
                        let key = Buffer.from(kv[j].key, 'base64').toString();
                        let value = Buffer.from(kv[j].value.bytes, 'base64').toString();

                        let kvObj = {
                            key: key,
                            value: value
                        }
                        
                        if(key!=='owner') data.push(kvObj)

                        if (key === 'owner') {
                            value = kv[j].value.bytes;
                            value = (algosdk.encodeAddress(new Uint8Array(Buffer.from(value, 'base64'))));
                            owner = value;
                        }
                        if (j === kvLength - 1 && owner !== undefined) {
                            return ({ found: true, address: owner, socials: data })
                        }
                    }
                }
            }
            return ({ found: false });
        } catch (err) {
            
            return ({ found: false });
        }
    },

    getAddress: async (name) => {
        const result = await Algorand.searchForName(name);
        try{
            if(result.found) return {
                address:result.address,
                found: true
            }
            else return {found:false};
        } catch(err){
            return err;
        }
        
    },

    createGroupTxns : async (name, address) => {
        const algodClient = client;

        /* 1st Txn - Payment to Smart Contract */

        let amount;
        const lsig = await Algorand.generateLsig(name);
        const params = await algodClient.getTransactionParams().do();

        params.fee = 1000;
        params.flatFee = true;

        let receiver = algosdk.getApplicationAddress(parseInt(process.env.APP_ID));
        let sender = address;

        if (name.length <= 3) return;
        else if (name.length === 8) amount = 313000000
        else if (name.length === 9) amount = 125000000
        else if (name.length >= 10) amount = 32000000

        let closeToRemaninder = undefined;
        let note = undefined;


        let txn1 = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeToRemaninder, note, params);

        const groupTxns = [];
        groupTxns.push(txn1);

        /* 2nd Txn - Funding Lsig */

        sender = address;
        receiver = lsig.address();
        amount = 1100000;

        let txn2 = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeToRemaninder, note, params);

        groupTxns.push(txn2);

        /* 3rd Txn - Optin to App from Lsig */
        
        let txn3 = await algosdk.makeApplicationOptInTxnFromObject({
            from: lsig.address(),
            suggestedParams: params,
            appIndex: this.APP_ID
        });

        groupTxns.push(txn3);

        sender = lsig.address();
        receiver = address;
        amount = 0;

        /* 4th Txn - Lsig rekey to owner */

        let txn4 = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeToRemaninder, note, params, receiver);
        groupTxns.push(txn4);

        /* 5th Txn - Lsig registers name */

        let method = "register_name";
        let account = address;

        let appArgs = [];

        appArgs.push(new Uint8Array(Buffer.from(method)));
        appArgs.push(algosdk.decodeAddress(account).publicKey);
        let txn5 = await algosdk.makeApplicationNoOpTxn(address, params, this.APP_ID, appArgs, [lsig.address()]);
        groupTxns.push(txn5);

        let txGroup = algosdk.assignGroupID(groupTxns);

        let signedOptinTxn = algosdk.signLogicSigTransaction(groupTxns[2], lsig);
        let signedRekeyTxn = algosdk.signLogicSigTransactionObject(groupTxns[3], lsig);
        
        const txnsToBeSigned = [groupTxns[0], groupTxns[1], groupTxns[4]];

        return ({ txnsToBeSigned: txnsToBeSigned, txns: groupTxns });
    },

    sendTxnToNetwork: async (signed) => {
                
        try {
            const sendToNetwork = await this.getClient().sendRawTransaction(signed).do();
            return ({success: true});
        } catch (err) {
            return ({success: false, error: err.message});
        }
    }
}

module.exports = Algorand;

