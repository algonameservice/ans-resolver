const { default: algosdk } = require('algosdk');
const express = require('express');
const router = express.Router();

const helper = require('../helper/Algorand.js');

let cachedResponses = {};
let nameInfo = {
    transactions: [],
    nameRegistrations: 0,
    nameTransfers: 0,
    latestPullTimestamp: '',
    totalTransactions: 0,
    lastTenRegistrations: []
};
const TTL = 5; //in minutes

router.get('/insights', async function(req, res){

    let info;
    if(nameInfo.transactions.length === 0) {
        info = await helper.lookupApplication();
        nameInfo.transactions = info.slice(0,50);
        nameInfo.totalTransactions = info.length;
        nameInfo.latestPullTimestamp = new Date();
        
        for(let i=0; i<info.length; i++) {
            let args = info[i]["application-transaction"]["application-args"];
            
            if(args.length > 0) {
                if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                    nameInfo.nameRegistrations++;
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    nameInfo.nameTransfers++;
                }
            } 
        }
        
    } else {
        info = await helper.lookupApplication(nameInfo.latestPullTimestamp);
        
        for(let i=0; i<info.length; i++) {
            let args = info[i]["application-transaction"]["application-args"];
            
            if(args.length > 0) {
                if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                    nameInfo.nameRegistrations++;
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    nameInfo.nameTransfers++;
                }
            } 
        }
        if(info.length > 0) {
            nameInfo.latestPullTimestamp = new Date();
            nameInfo.transactions = nameInfo.transactions.reverse();
            nameInfo.transactions = nameInfo.transactions.concat(info.reverse());
            nameInfo.transactions = nameInfo.transactions.reverse();
            
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
                    console.log(name.nameRegistered);
                    nameInfo.lastTenRegistrations.push(name);
                    count++;
                    
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    //nameInfo.nameTransfers++;
                }
            } 
        } catch (err) {
            console.log(err);
            console.log(nameInfo.transactions[i]);
        }
        
    }

    res.status(200).json({
        totalNameRegistrations: nameInfo.nameRegistrations,
        totalTransactions: nameInfo.transactions.length, 
        totalNameTransfers: nameInfo.nameTransfers,
        lastTenRegistrations: nameInfo.lastTenRegistrations
    });
    
});

router.get('/:name', async function(req, res){

    let name = req.params.name;
    const params = req.query;
    name = name.split('.algo')[0];
    name = name.toLowerCase();
    
    if(Object.keys(params).length === 0) {
        let result;
        if(cachedResponses[name] !== undefined) {
            let now = new Date();
            let cachedTime = new Date(cachedResponses[name].time);
            if(new Date(cachedTime.setMinutes(cachedTime.getMinutes()+TTL))>now) 
            res.status(200).json({found: true, address: cachedResponses[name].address});
            else {
                
                let nameInfo; 
                nameInfo = await helper.searchForName(name);
                let result; 
                result = {
                    found:nameInfo.found, 
                    address:nameInfo.address
                }
                cachedResponses[name] = {
                    address: result.address,
                    time: new Date()
                }
                res.status(200).json(result);
            }
        } else {
            result = await helper.getAddress(name);
            if(result.found) {            
                
                cachedResponses[name] = {
                    address: result.address,
                    time : new Date()
                }
                res.status(200).json(result);
            }
            else {
                res.status(404).json(result);
            }
        }
    }
    
    else {
        
        let nameInfo; 
        nameInfo = await helper.searchForName(name);
        let result; 
        result = {
            found:nameInfo.found, 
            address:nameInfo.address
        }
        if(params.socials === 'true' && params.metadata === 'true') {
            result["socials"]= nameInfo.socials;
            result["metadata"] = nameInfo.data;
        }
        else if(params.socials === 'true') {
            result["socials"]= nameInfo.socials;
        }
        else if (params.metadata === 'true') {
            result["metadata"] = nameInfo.data;
        }
        else if (Object.keys(params).length === 1) {
            const keyToFind = Object.keys(params)[0];
            let found = false;
            let value;
            
            for(let key in nameInfo.socials) {
                let record = nameInfo.socials[key];
                if(record.key === keyToFind) {
                    found=true;
                    value=record.value;
                    
                    break;
                }
            }
            if(!found) {
                for(let key in nameInfo.data) {
                    let record = nameInfo.data[key];
                    if(record.key === keyToFind) {
                        found=true;
                        value=record.value;
                        break;
                    }
                }
            }

            if(found) {
                result[keyToFind] = value;
            } else {
                result[keyToFind] = 'Property not found';
            }
            
        }
        else {
            result = await helper.getAddress(name);
        }

        if(nameInfo.found) {            
            cachedResponses[name] = result.address;
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
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