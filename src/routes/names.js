const { default: algosdk } = require('algosdk');
const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const helper = require('../helper/Algorand.js');
const { Worker } = require('worker_threads')
const namesCache = new NodeCache({
    stdTTL: 60*5,
    deleteOnExpire: true
});

let addresses = {

};

let nameInfo = {
    transactions: [],
    nameRegistrations: 0,
    nameTransfers: 0,
    latestPullTimestamp: '',
    totalTransactions: 0,
    lastTenRegistrations: [],
    nameRenewals: 0
};

let LOCK = false;

router.get('/insights', async function(req, res){

    let info;
    if(nameInfo.transactions.length === 0) {
        info = await helper.lookupApplication();
        nameInfo.totalTransactions = info.length;
        
        nameInfo.transactions = info.slice(0,50);
        nameInfo.latestPullTimestamp = new Date();
        
        
        for(let i=0; i<info.length; i++) {
            
            let args = info[i]["application-transaction"]["application-args"];
            
            if(args.length > 0) {
                if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                    nameInfo.nameRegistrations++;
                    if(addresses[info[i].sender] !== undefined) addresses[info[i].sender]++;
                    else addresses[info[i].sender] = 1;
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    nameInfo.nameTransfers++;
                    if(addresses[info[i].sender] !== undefined) addresses[info[i].sender]++;
                    else addresses[info[i].sender] = 1;
                }
                else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                    nameInfo.nameRenewals++;
                }
            } 
        }
        
    } else {
        if(!LOCK){
            LOCK = true;
            info = await helper.lookupApplication(nameInfo.latestPullTimestamp);
            nameInfo.totalTransactions += info.length;
            
            for(let i=0; i<info.length; i++) {
                let args = info[i]["application-transaction"]["application-args"];
                
                if(args.length > 0) {
                    if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                        
                        nameInfo.nameRegistrations++;
                        
                        if(addresses[info[i].sender] !== undefined) addresses[info[i].sender]++;
                        else addresses[info[i].sender] = 1;
                       
                        
                    } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                        
                        nameInfo.nameTransfers++;
                        
                        if(addresses[info[i].sender] !== undefined) addresses[info[i].sender]++;
                        else addresses[info[i].sender] = 1;
                        
                        
                    } else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                        
                        nameInfo.nameRenewals++;
                            
                        
                    }
                } 
            }
            if(info.length > 0) {
                nameInfo.latestPullTimestamp = new Date();
                nameInfo.transactions = nameInfo.transactions.reverse();
                nameInfo.transactions = nameInfo.transactions.concat(info.reverse());
                nameInfo.transactions = nameInfo.transactions.reverse();
                
            }
            LOCK = false;
        }
        
        
    }

    let count = 0;
    let hex;
    let numberStr='';
    nameInfo.lastTenRegistrations = [];
    
    
    for(let i=0; i<nameInfo.transactions.length && count < 10; i++) {
        try{
            
            let args = nameInfo.transactions[i]["application-transaction"]["application-args"];
            let sender = nameInfo.transactions[i]["sender"];
            numberStr = '';
            if(args.length > 0) {
                if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                    hex = Buffer.from(args[2], 'base64').toString();
                    hex = Buffer.from(hex, 'utf-8');
                    for(let i=0; i<hex.length; i++){
                        numberStr+=hex[i];
                    }
                    numberStr=parseInt(numberStr, 8);
                    let name = {
                        owner: sender,
                        nameRegistered: Buffer.from(args[1], 'base64').toString(),
                        period: numberStr
                    };
                    
                    nameInfo.lastTenRegistrations.push(name);
                    count++;

                    
                    
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    nameInfo.nameTransfers++;
                }
                else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                    nameInfo.nameRenewals++;
                }
            } 
        } catch (err) {
            console.log(err);
        }
        
    }

    res.status(200).json({
        totalNameRegistrations: nameInfo.nameRegistrations,
        totalTransactions: nameInfo.totalTransactions, 
        totalNameTransfers: nameInfo.nameTransfers,
        lastTenRegistrations: nameInfo.lastTenRegistrations,
        addresses: addresses,
        totalRenewals: nameInfo.nameRenewals
    });
    
});

router.get('/:name', async function(req, res){

    let name = req.params.name;
    const params = req.query;


    name = name.split('.algo')[0];
    name = name.toLowerCase();
    
    let cachedResult = namesCache.get(name);
    
    if(cachedResult === undefined || Object.keys(params).length !== 0){
        
        const seprateThread = new Worker("./src/helper/resolveNameThread.js");
        seprateThread.on("message", (response) => {
            let nameObject = {
                address: response.result.address,
                time: new Date()
            }
            namesCache.set(name, nameObject);
            res.status(response.status).json(response.result);
        });
        seprateThread.postMessage({
            name: name,
            params: params
        });
    } else {
        res.status(200).json({found:true, address: cachedResult.address});
    }
    

})

router.post('/register/txns', async function(req, res){
    let params = req.body;
    
    let name = params.name.split('.')[0];
    let address = params.address;
    let period = params.period;

    let result;
    try{
        result = await helper.searchForName(name);
        
        if(!result.found) {
            const txns = await helper.createGroupTxnsToSign(name, address, period);
            res.status(200).json(txns);
        } else {
            res.status(400).json({success: false, error: 'Name already registered'})
        }
    }catch(err){
        
        res.json({success: false, error: err.message})
    }
    
    

})

router.post('/register/confirm', async function(req, res){

    let params = req.body;
    const signedTxns = params.signedTxns;

    if(signedTxns.length !== 4) res.status(400).json({success: false, error: `
        4 transactions expected. Received ${signedTxns.length}
    `})
   
    try{
        const confirm = await helper.sendTxnToNetwork(signedTxns);
        res.status(200).json(confirm);
    } catch(err) {
        res.status(400).json({success: false, error: err.message})
    }

});

router.post('/renew', async function(req, res){
    let params = req.body;
    
    let name = params.name.split('.')[0];
    let address = params.address;
    let period = parseInt(params.period);

    let amount;
    
    if(name.length < 3 || name.length > 64) {
        res.status(400).json({success: false, error: 'Name must be longer than 3 characters and shorter than 64 characters'});
        return;
    }

    if(!algosdk.isValidAddress(address)){
        
        res.status(400).json({success: false, error: 'Invalid algorand address provided'});
        return;

    }
    

    if(name.length === 3) amount = period*parseInt(process.env.CHAR_3_AMOUNT);
    else if(name.length === 4) amount = period*parseInt(process.env.CHAR_4_AMOUNT);
    else if(name.length >= 5) amount = period*parseInt(process.env.CHAR_5_AMOUNT);
    

    let result;
    try{
        result = await helper.searchForName(name);
        
        if(result.found) {
            if(result.address !== address) {
                res.status(400).json({success: false, error: 'The name does not belong to the address provided'})
            }else {
                const txns = await helper.createRenewalTxn(name, address, period, amount);
                res.status(200).json(txns);
            }
        } else {
            res.status(400).json({success: false, error: 'Name not registered'})
        }
    }catch(err){
        
        res.json({success: false, error: err.message})
    }
    
    

})

router.post('/update', async function (req, res) {
    let params = req.body;
   
    let name = params.name.split('.')[0];
    let address = params.address;
    let editedHandles = params.updatedHandles;

    let checkForError = false;
    
    if(!algosdk.isValidAddress(address)) {
        res.status(400).json({success:false, error: 'Invalid address'});
        checkForError = true;
    }
    if(!editedHandles || Object.keys(editedHandles).length === 0) {
        res.status(400).json({success:false, error: 'Must provide a json object for handles'});
        checkForError = true;
    }

    if(!checkForError) {
        let result;
        try{
            result = await helper.searchForName(name);
            if(result.found) {
                if(result.address !== address) res.status(400).json({success: false, error: 'This address is not the owner'});
                else {
                    const txns = await helper.updateName(name, address, editedHandles);
                    res.status(200).json(txns);
                }
            } else {
            res.status(400).json({success: false, error: 'Name not registered'})
            }
        }catch(err){
            
            res.json({success: false, error: err.message})
        }
    }
    
})

//TODO: Name renewal transaction

router.post('/put-for-transfer', async function (req, res) {
    let params = req.body;
   
    let name = params.name.split('.')[0];
    let address = params.owner;
    let newOwner = params.transfer_to;
    let price = params.price;

    let checkForError = false;
    
    if(!algosdk.isValidAddress(address)) {
        res.status(400).json({success:false, error: 'Invalid owner address'});
        checkForError = true;
    }
    else if (!algosdk.isValidAddress(newOwner)) {
        res.status(400).json({success:false, error: 'Transfer to address is invalid'});
        checkForError = true;
    }

    if(!checkForError) {
        let result;
        try{
            result = await helper.searchForName(name);
            if(result.found) {
                if(result.address !== address) res.status(400).json({success: false, error: 'Name does not belong to the given address'});
                else {
                    const txns = await helper.createTransferTransaction(name, address, newOwner, price);
                    res.status(200).json(txns);
                }
            } else {
            res.status(400).json({success: false, error: 'Name not registered'})
            }
        }catch(err){
            
            res.json({success: false, error: err.message})
        }
    }
    
})

router.post('/accept-transfer', async function (req, res) {
    let params = req.body;
   
    let name = params.name.split('.')[0];
    let address = params.current_owner;
    let newOwner = params.new_owner;
    let price = params.price;
    
    let checkForError = false;
    
    if(!algosdk.isValidAddress(address)) {
        res.status(400).json({success:false, error: 'Invalid owner address'});
        checkForError = true;
    }
    else if (!algosdk.isValidAddress(newOwner)) {
        res.status(400).json({success:false, error: 'Transfer to address is invalid'});
        checkForError = true;
    }

    if(!checkForError) {
        let result;
        try{
            result = await helper.searchForName(name);
            if(result.found) {
                if(result.address !== address) res.status(400).json({success: false, error: 'Name does not belong to the given address'});
                else {
                    const txns = await helper.createConfirmTransferTransactions(name, address, newOwner, price);
                    res.status(200).json(txns);
                }
            } else {
            res.status(400).json({success: false, error: 'Name not registered'})
            }
        }catch(err){
            
            res.json({success: false, error: err.message})
        }
    }
    
})



router.get('/', function(req, res){
    res.status(400).send('Provide a name to lookup')
});


module.exports = router