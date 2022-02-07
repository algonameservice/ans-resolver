const { default: algosdk } = require('algosdk');
const express = require('express');
const router = express.Router();

const helper = require('../helper/Algorand.js');

let cachedResponses = {}

router.get('/:name', async function(req, res){

    let name = req.params.name;
    const params = req.query;
    name = name.split('.algo')[0];
    
    if(Object.keys(params).length === 0) {
        let result;
        if(cachedResponses[name] !== undefined) {
            res.status(200).json({found: true, address: cachedResponses[name]})
        } else {
            result = await helper.getAddress(name);
            if(result.found) {            
                cachedResponses[name] = result.address;
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
})

module.exports = router