const algosdk = require('algosdk')
require('dotenv').config()

const client = new algosdk.Algodv2({ 'X-API-KEY': process.env.PURESTAKE_API_KEY },
            process.env.PURESTAKE_CLIENT_URL,
            '');


/*const indexer = new algosdk.Indexer({ 'X-API-KEY': process.env.PURESTAKE_API_KEY },
            process.env.PURESTAKE_INDEXER_URL,
            '');  */

const indexer = new algosdk.Indexer('','https://algoexplorerapi.io/idx2','');          

const Algorand = {

    generateTeal : (name) => {
        
        const tealCode = `#pragma version 4
        byte "${name}"
        len
        int 3
        ==
        bnz main_l22
        byte "${name}"
        len
        int 4
        ==
        bnz main_l13
        byte "${name}"
        len
        int 5
        >=
        bnz main_l4
        err
        main_l4:
        gtxn 0 Amount
        int 5000000
        >=
        assert
        byte "${name}"
        len
        int 64
        <=
        assert
        int 0
        store 0
        main_l5:
        load 0
        byte "${name}"
        len
        <
        bnz main_l12
        global GroupSize
        int 2
        ==
        global GroupSize
        int 4
        ==
        ||
        assert
        gtxn 0 Sender
        gtxn 1 Sender
        ==
        assert
        gtxn 0 Receiver
        addr SYGCDTWGBXKV4ZL5YAWSYAVOUC25U2XDB6SMQHLRCTYVF566TQZ3EOABH4
        ==
        assert
        global GroupSize
        int 2
        ==
        bnz main_l11
        global GroupSize
        int 4
        ==
        bnz main_l10
        int 0
        return
        main_l9:
        int 1
        assert
        int 1
        b main_l31
        main_l10:
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        gtxn 2 ApplicationID
        int 628095415
        ==
        &&
        gtxn 2 OnCompletion
        int OptIn
        ==
        &&
        gtxn 3 ApplicationID
        int 628095415
        ==
        &&
        gtxn 3 Sender
        gtxn 0 Sender
        ==
        &&
        gtxna 3 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 3 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l9
        main_l11:
        gtxn 1 ApplicationID
        int 628095415
        ==
        gtxna 1 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 1 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l9
        main_l12:
        byte "${name}"
        load 0
        getbyte
        int 97
        >=
        byte "${name}"
        load 0
        getbyte
        int 122
        <=
        &&
        byte "${name}"
        load 0
        getbyte
        int 48
        >=
        byte "${name}"
        load 0
        getbyte
        int 57
        <=
        &&
        ||
        assert
        load 0
        int 1
        +
        store 0
        b main_l5
        main_l13:
        gtxn 0 Amount
        int 50000000
        >=
        assert
        byte "${name}"
        len
        int 64
        <=
        assert
        int 0
        store 0
        main_l14:
        load 0
        byte "${name}"
        len
        <
        bnz main_l21
        global GroupSize
        int 2
        ==
        global GroupSize
        int 4
        ==
        ||
        assert
        gtxn 0 Sender
        gtxn 1 Sender
        ==
        assert
        gtxn 0 Receiver
        addr SYGCDTWGBXKV4ZL5YAWSYAVOUC25U2XDB6SMQHLRCTYVF566TQZ3EOABH4
        ==
        assert
        global GroupSize
        int 2
        ==
        bnz main_l20
        global GroupSize
        int 4
        ==
        bnz main_l19
        int 0
        return
        main_l18:
        int 1
        assert
        int 1
        b main_l31
        main_l19:
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        gtxn 2 ApplicationID
        int 628095415
        ==
        &&
        gtxn 2 OnCompletion
        int OptIn
        ==
        &&
        gtxn 3 ApplicationID
        int 628095415
        ==
        &&
        gtxn 3 Sender
        gtxn 0 Sender
        ==
        &&
        gtxna 3 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 3 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l18
        main_l20:
        gtxn 1 ApplicationID
        int 628095415
        ==
        gtxna 1 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 1 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l18
        main_l21:
        byte "${name}"
        load 0
        getbyte
        int 97
        >=
        byte "${name}"
        load 0
        getbyte
        int 122
        <=
        &&
        byte "${name}"
        load 0
        getbyte
        int 48
        >=
        byte "${name}"
        load 0
        getbyte
        int 57
        <=
        &&
        ||
        assert
        load 0
        int 1
        +
        store 0
        b main_l14
        main_l22:
        gtxn 0 Amount
        int 150000000
        >=
        assert
        byte "${name}"
        len
        int 64
        <=
        assert
        int 0
        store 0
        main_l23:
        load 0
        byte "${name}"
        len
        <
        bnz main_l30
        global GroupSize
        int 2
        ==
        global GroupSize
        int 4
        ==
        ||
        assert
        gtxn 0 Sender
        gtxn 1 Sender
        ==
        assert
        gtxn 0 Receiver
        addr SYGCDTWGBXKV4ZL5YAWSYAVOUC25U2XDB6SMQHLRCTYVF566TQZ3EOABH4
        ==
        assert
        global GroupSize
        int 2
        ==
        bnz main_l29
        global GroupSize
        int 4
        ==
        bnz main_l28
        int 0
        return
        main_l27:
        int 1
        assert
        int 1
        b main_l31
        main_l28:
        gtxn 1 Receiver
        gtxn 2 Sender
        ==
        gtxn 2 ApplicationID
        int 628095415
        ==
        &&
        gtxn 2 OnCompletion
        int OptIn
        ==
        &&
        gtxn 3 ApplicationID
        int 628095415
        ==
        &&
        gtxn 3 Sender
        gtxn 0 Sender
        ==
        &&
        gtxna 3 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 3 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l27
        main_l29:
        gtxn 1 ApplicationID
        int 628095415
        ==
        gtxna 1 ApplicationArgs 0
        byte "register_name"
        ==
        &&
        gtxna 1 ApplicationArgs 1
        byte "${name}"
        ==
        &&
        assert
        b main_l27
        main_l30:
        byte "${name}"
        load 0
        getbyte
        int 97
        >=
        byte "${name}"
        load 0
        getbyte
        int 122
        <=
        &&
        byte "${name}"
        load 0
        getbyte
        int 48
        >=
        byte "${name}"
        load 0
        getbyte
        int 57
        <=
        &&
        ||
        assert
        load 0
        int 1
        +
        store 0
        b main_l23
        main_l31:
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
                
                if (app.id === parseInt(parseInt(process.env.APP_ID))) {

                    let kv = app['key-value'];

                    let kvLength = kv.length;
                    let owner;
                    let data = [];
                    let socials = [];
                    
                    for (let j = 0; j < kvLength; j++) {
                        let key = Buffer.from(kv[j].key, 'base64').toString();
                        let value = Buffer.from(kv[j].value.bytes, 'base64').toString();
                        if(key === 'expiry') {
                            value = new Date(kv[j].value.uint*1000).toDateString();
                        }
                        let kvObj = {
                            key: key,
                            value: value
                        }
                        
                        if(key!=='owner') {
                            if(key === 'github' 
                                || key === 'discord' 
                                || key === 'twitter' 
                                || key === 'reddit'
                                || key === 'telegram'
                                || key === 'youtube') socials.push(kvObj);
                            else data.push(kvObj)
                        }

                        if (key === 'owner') {
                            value = kv[j].value.bytes;
                            value = (algosdk.encodeAddress(new Uint8Array(Buffer.from(value, 'base64'))));
                            owner = value;
                        }
                        if (j === kvLength - 1 && owner !== undefined) {
                            return ({ found: true, address: owner, socials: socials, data: data })
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

    createGroupTxnsToSign: async (name, address, period) => {

        /* Group Txns Here 
            1st Transaction: Pay smart contract from user account
            2nd Transaction: Fund Lsig with user account
            3rd Transaction: Optin to smart contract from Lsig with user account
            4th Transaction: Regsiter into smart contract with user account
        */

        const algodClient = client;

        /* 1st Txn - Payment to Smart Contract */

        let amount;
        const lsig = await Algorand.generateLsig(name);
        const params = await algodClient.getTransactionParams().do();

        params.fee = 1000;
        params.flatFee = true;

        let receiver = algosdk.getApplicationAddress(parseInt(parseInt(process.env.APP_ID)));
        let sender = address;

        if(period === undefined) period = 0
        else period = period-1

        if (name.length < 3) return;
        else if (name.length === 3) amount = parseInt(process.env.CHAR_3_AMOUNT) + period*parseInt(process.env.CHAR_3_AMOUNT)
        else if (name.length === 4) amount = parseInt(process.env.CHAR_4_AMOUNT) + period*parseInt(process.env.CHAR_4_AMOUNT)
        else if (name.length >= 5) amount = parseInt(process.env.CHAR_5_AMOUNT) + period*parseInt(process.env.CHAR_5_AMOUNT)

        let closeToRemaninder = undefined;
        let note = undefined;

        
        
        let txn1 = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeToRemaninder, note, params);

        const groupTxns = [];
        groupTxns.push(txn1);

        /* 2nd Txn - Funding Lsig */

        sender = address;
        receiver = lsig.address();
        amount = 915000;

        let txn2 = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amount, closeToRemaninder, note, params);

        groupTxns.push(txn2);

        /* 3rd Txn - Optin to App from Lsig */
        
        let txn3 = await algosdk.makeApplicationOptInTxnFromObject({
            from: lsig.address(),
            suggestedParams: params,
            appIndex: parseInt(parseInt(process.env.APP_ID))
        });

        groupTxns.push(txn3);

        sender = lsig.address();
        receiver = address;
        amount = 0;

        /* 4th Txn - Account registers name */

        let method = "register_name";
        

        let appArgs = [];

        period = period+1

        appArgs.push(new Uint8Array(Buffer.from(method)));
        //appArgs.push(algosdk.decodeAddress(account).publicKey);
        appArgs.push(new Uint8Array(Buffer.from(name)))
        appArgs.push(algosdk.encodeUint64(period))
        let txn4 = await algosdk.makeApplicationNoOpTxn(address, params, parseInt(parseInt(process.env.APP_ID)), appArgs, [lsig.address()]);
        groupTxns.push(txn4);

        algosdk.assignGroupID(groupTxns);

        let signedOptinTxn = algosdk.signLogicSigTransaction(groupTxns[2], lsig);

        return ({ optinTxn: signedOptinTxn, txns: groupTxns });

    },

    async createRenewalTxn (name, sender, years, amt) {
        //amt = algosdk.algosToMicroalgos(amt);
        const params = await client.getTransactionParams().do();
        let receiver = algosdk.getApplicationAddress(parseInt(process.env.APP_ID));
        let closeToRemaninder=undefined;
        let note=undefined;
        let paymentTxn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amt, closeToRemaninder, note, params);

        name = name.split('.algo')[0];

        let lsig = await Algorand.generateLsig(name);

        let appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("renew_name")));
        appArgs.push(algosdk.encodeUint64(years));

        let applicationTxn = algosdk.makeApplicationNoOpTxn(sender, params, parseInt(process.env.APP_ID), appArgs, [lsig.address()]);

        algosdk.assignGroupID([paymentTxn, applicationTxn]);

        const groupTxns = [paymentTxn, applicationTxn];
        return groupTxns;

    },

    updateName: async (name, address, editedHandles) => {

        const algodClient = client;

        const lsig = await Algorand.generateLsig(name);
        const params = await algodClient.getTransactionParams().do();
        params.fee = 1000;
        params.flatFee = true;

        let method = "update_name";

        const groupTxns = [];

        for(let key in editedHandles) {
            
            let appArgs=[];
            let network = key;
            let handle = editedHandles[key];
            
            appArgs.push(new Uint8Array(Buffer.from(method)));
            appArgs.push(new Uint8Array(Buffer.from(network)));
            appArgs.push(new Uint8Array(Buffer.from(handle)));

            let txn = await algosdk.makeApplicationNoOpTxn(address, params, parseInt(parseInt(process.env.APP_ID)), appArgs, [lsig.address()]);
            groupTxns.push(txn);
        }

    
        algosdk.assignGroupID(groupTxns);
        return groupTxns;

    },

    createTransferTransaction : async (name, sender, newOwner, price) => {
        price = algosdk.algosToMicroalgos(price);
        const params = await client.getTransactionParams().do();
        name = name.split('.algo')[0];

        let lsig = await Algorand.generateLsig(name);

        let appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("initiate_transfer")));
        appArgs.push(algosdk.encodeUint64(price));

        let applicationTxn = algosdk.makeApplicationNoOpTxn(sender, params, parseInt(parseInt(process.env.APP_ID)), appArgs, [lsig.address(), newOwner]);
        return applicationTxn;

    },

    createConfirmTransferTransactions : async (name, sender, receiver, amt) => {
        amt = algosdk.algosToMicroalgos(amt);
        const params = await client.getTransactionParams().do();
        
        let closeToRemaninder=undefined;
        let note=undefined;
        let paymentToOwnerTxn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, amt, closeToRemaninder, note, params);

        receiver = algosdk.getApplicationAddress(parseInt(parseInt(process.env.APP_ID)));
        
        let paymentToSmartContractTxn = algosdk.makePaymentTxnWithSuggestedParams(sender, receiver, parseInt(process.env.TRANSFER_FEE), closeToRemaninder, note, params);

        name = name.split('.algo')[0];

        let lsig = await Algorand.generateLsig(name);

        let appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("accept_transfer")));
        
        let applicationTxn = algosdk.makeApplicationNoOpTxn(sender, params, parseInt(parseInt(process.env.APP_ID)), appArgs, [lsig.address()]);

        algosdk.assignGroupID([paymentToOwnerTxn, paymentToSmartContractTxn, applicationTxn]);

        const groupTxns = [paymentToOwnerTxn, paymentToSmartContractTxn, applicationTxn];
        return groupTxns;

    },

    sendTxnToNetwork: async (signed) => {
                
        try {
            const sendToNetwork = await client.sendRawTransaction(signed).do();
            return ({success: true});
        } catch (err) {
            return ({success: false, error: err.message});
        }
    },

    lookupApplication: async (timestamp) => {
        let nextToken = '';
        let txnLength = 1;
        let txns = [];
        let count=0;
        
        while(txnLength > 0){
            try{
                let info = await indexer.searchForTransactions().applicationID(process.env.APP_ID || 628095415).
                limit(10000).
                nextToken(nextToken).
                afterTime(timestamp).do();
                txnLength=info.transactions.length;
                
                if(txnLength > 0) {
                    count++;
                    nextToken = info["next-token"];
                    txns.push(info.transactions);
                }
                
                
            }catch(err){
                console.log(err);
                return false;
            }
        }

        let allTxns = [];
        for(let i=0; i<txns.length; i++){
            allTxns=allTxns.concat(txns[i]);
        }
        return allTxns.reverse();
       
        
    },

    lookupTransactionsByAddress : async (account, socials, metadata, limit) => {

        let nextToken = '';
        let txnLength = 1;
        let txns = [];
        let count=0;
        while(txnLength > 0){
            try{
                let info = await indexer.lookupAccountTransactions(account).
                limit(10000).
                afterTime('2022-02-25').
                nextToken(nextToken).do();
                txnLength=info.transactions.length;
                if(txnLength > 0) {
                    count++;
                    nextToken = info["next-token"];
                    txns.push(info.transactions);
                }
                
            }catch(err){
                return false;
            }
        }

        let accountTxns = [];
        for(let i=0; i<txns.length; i++){
            accountTxns=accountTxns.concat(txns[i]);
        }
      
        txns = accountTxns;
        const names = [];
        
        try{
     
            for(let i=0; i<txns.length; i++) {
                let txn= txns[i];
                
                if(txn["tx-type"] === "appl") {
                    
                    if(txn["application-transaction"]["application-id"] === parseInt(parseInt(process.env.APP_ID))) {
                        
                        let appArgs = txn["application-transaction"]["application-args"];
                        
                        if(Buffer.from(appArgs[0], "base64").toString() === "register_name") {
                            if(!names.includes(Buffer.from(appArgs[1], 'base64').toString())) names.push(Buffer.from(appArgs[1], 'base64').toString())
                        }
                        else if(Buffer.from(appArgs[0], 'base64').toString() === "accept_transfer"){
                            let lsigAccount = txn["application-transaction"]["accounts"][0];
                            let accountInfo = await indexer.lookupAccountByID(lsigAccount).do();
                            
                            accountInfo = accountInfo.account['apps-local-state'];
                            
                            const length = accountInfo.length;
                            for(let i=0; i<length; i++){
                                if(accountInfo[i].id === parseInt(parseInt(process.env.APP_ID))) {
                                    let kvPairs = accountInfo[i]["key-value"];
                                    for(let j=0; j<kvPairs.length; j++) {
                                        let key = Buffer.from(kvPairs[j].key, 'base64').toString();
                                        let value = Buffer.from(kvPairs[j].value.bytes, 'base64').toString();

                                        if(key === 'name') {
                                            
                                            if(!names.includes(value)) names.push(value);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } catch (err) {
            
            return []
        }
       
        if(names.length > 0) {

            let details=[];
            for(let i=0; i<names.length; i++) {
                
                if(limit !== undefined) {
                    if(details.length >= limit) break;
                }
                let info = await Algorand.searchForName(names[i]);
                let data={
                    socials: {},
                    metadata: {}
                };
                data["name"] = names[i]+'.algo';

                if(!socials) delete data.socials;
                if(!metadata) delete data.metadata;
                
                if(info.found && info.address !== undefined) {

                    if(info.address === account){

                        let kvPairs = info.socials;
                        if(kvPairs.length > 0) {
                            for(let j=0; j<kvPairs.length; j++) {
                                if(kvPairs[j].key === 'expiry') {
                                    let expiry = kvPairs[j].value;
                                    data["expiry"] = expiry;
                                } else {
                                    if(socials && kvPairs[j].key !== "name") data["socials"][kvPairs[j].key] = kvPairs[j].value
                                }
                            }
                        }

                        kvPairs = info.data;
                       
                        if(kvPairs.length > 0) {
                            for(let j=0; j<kvPairs.length; j++) {
                                if(kvPairs[j].key === 'expiry') {
                                    let expiry = kvPairs[j].value;
                                    data["expiry"] = expiry;
                                } else {
                                    if(metadata && kvPairs[j].value !== "" && kvPairs[j].key !== "name") data["metadata"][kvPairs[j].key] = kvPairs[j].value
                                }
                            }
                        }
                        
                        details.push(data);
                        
                    }
                    
                } else {
                    i = i-1;
                }
                
                
            }
            return (details);
        }
        

    }
}

module.exports = Algorand;

