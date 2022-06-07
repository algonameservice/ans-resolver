const algosdk = require('algosdk');
require('dotenv').config();
const { Client, Indexer, GetTeal } = require('./Config');
const {ANS} = require('@algonameservice/sdk');
const {NormalizeName} = require('./Utility');

const client = Client();
const indexer = Indexer();
const APP_ID =
  process.env.NETWORK === 'TestNet'
    ? parseInt(process.env.TESTNET_APP_ID, 10)
    : parseInt(process.env.APP_ID, 10);

const SDK = new ANS(client, indexer);

const Algorand = {

  getLatestDomains: async (timestamp) => {
    let nextToken = '';
    let txnLength = 1;
    let txns = [];
    while(txnLength > 0){
        try{
            let info = await indexer.searchForTransactions().applicationID(APP_ID).
            limit(10000).
            nextToken(nextToken).
            afterTime(timestamp).
            do();
            txnLength=info.transactions.length;
            if(txnLength > 0) {
                nextToken = info["next-token"];
                txns.push(info.transactions);
            }
            
            
        }catch(err){
            return false;
        }
    }

    let allTxns = [];
    for(let i=0; i<txns.length; i++){
        allTxns=allTxns.concat(txns[i]);
    }
    const info = allTxns.reverse();
    let domains = {};
    let transfers = {};
    for(let i=0; i<info.length; i++) {
        const applTxn = info[i]["application-transaction"];
        
        let sender = info[i]["sender"];
        let args = info[i]["application-transaction"]["application-args"];
        let accounts = info[i]["application-transaction"]["accounts"];
        
        if(args.length > 0) {
            if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                const domain = Buffer.from(args[1], 'base64').toString();
                domains[domain] = {
                    lsig: accounts[0],
                    address: sender,
                    found: true,
                    name: domain+'.algo'
                }
            } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer'){
                try{
                  let accountInfo = await indexer
                    .lookupAccountByID(accounts[0])
                    .do();
                  accountInfo = accountInfo.account['apps-local-state'];
                  const { length } = accountInfo;
                  for (let i = 0; i < length; i++) {
                    if (accountInfo[i].id === APP_ID) {
                      const kvPairs = accountInfo[i]['key-value'];
                      for (let j = 0; j < kvPairs.length; j++) {
                        const key = Buffer.from(
                          kvPairs[j].key,
                          'base64'
                        ).toString();
                        const value = Buffer.from(
                          kvPairs[j].value.bytes,
                          'base64'
                        ).toString();

                        if (key === 'name') {
                          if(!transfers[value]) {
                            transfers[value] = sender;
                          } 
                          break;
                        }
                      }
                    }
                  }

                } catch (err) {
                  console.log(err);
                }
                
                
            }
        } 
        
    }
    return {
      latestDomainsRetrieved: domains,
      latestTransfers: transfers
    };
  },

  generateTeal: (name) => {
    return GetTeal(name);
  },

  generateLsig: async (name) => {
    let program = await client.compile(Algorand.generateTeal(name)).do();
    program = new Uint8Array(Buffer.from(program.result, 'base64'));

    const lsig = algosdk.makeLogicSig(program);

    return lsig;
  },

  searchForName: async (name) => {
    name = NormalizeName(name);
    return await SDK.name(name).getAllInformation();
  },

  getAddress: async (name) => {
    name = NormalizeName(name);
    const result = await SDK.name(name).getAllInformation();
    try {
      if (result.found)
        return {
          name: `${name}`,
          address: result.address,
          found: true,
        };
      return { found: false };
    } catch (err) {
      return err;
    }
  },

  createGroupTxnsToSign: async (name, address, period) => {
    name = NormalizeName(name);
    return await SDK.name(name).register(address, period);
  },

  updateName: async (name, address, editedHandles) => {
    name = NormalizeName(name);
    return await SDK.name(name).update(address, editedHandles);
  },

  createTransferTransaction: async (name, sender, newOwner, price) => {
    name = NormalizeName(name);
    return await SDK.name(name).initTransfer(sender, newOwner, price);
  },

  createConfirmTransferTransactions: async (name, sender, receiver, amt) => {
    name = NormalizeName(name);
    return await SDK.name(name).acceptTransfer(sender, receiver, amt);
  },

  sendTxnToNetwork: async (signed) => {
    try {
      await client.sendRawTransaction(signed).do();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  lookupApplication: async (timestamp) => {
    let nextToken = '';
    let txnLength = 1;
    const txns = [];

    while (txnLength > 0) {
      try {
        const info = await indexer
          .searchForTransactions()
          .applicationID(APP_ID || 628095415)
          .limit(10000)
          .nextToken(nextToken)
          .afterTime(timestamp)
          .do();
        txnLength = info.transactions.length;

        if (txnLength > 0) {
          nextToken = info['next-token'];
          txns.push(info.transactions);
        }
      } catch (err) {
        return false;
      }
    }

    let allTxns = [];
    for (let i = 0; i < txns.length; i++) {
      allTxns = allTxns.concat(txns[i]);
    }
    return allTxns.reverse();
  },

  lookupTransactionsByAddress: async (account, socials, metadata, limit) => {
    const options = {
      socials: socials,
      metadata: metadata,
      limit: limit
    }
    return await SDK.address(account).getNames(options);
  },
};

module.exports = Algorand;
