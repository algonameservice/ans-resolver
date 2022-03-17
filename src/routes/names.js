const { default: algosdk } = require('algosdk');
const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const helper = require('../helper/Algorand.js');
const Insights = require('../helper/Insights');

const path = require('path');

const Piscina = require('piscina');
const piscina = new Piscina({
  filename: path.resolve(__dirname, '../helper/resolveNameThread.js')
});

const namesCache = new NodeCache({
    stdTTL: 60*5,
    deleteOnExpire: true
});

router.get('/insights', async function(req, res){

    const insightsInformation = await new Insights().getInsights();
    res.json(insightsInformation);
    
});

router.get('/:name', async function(req, res){

    let name = req.params.name;
    const params = req.query;


    name = name.split('.algo')[0];
    name = name.toLowerCase();
    
    let cachedResult = namesCache.get(name);
    
    if(cachedResult === undefined || Object.keys(params).length !== 0){
        
        const response = await piscina.run({
            name: name,
            params: params
        });
        if(response.result.found){
            let nameObject = {
                address: response.result.address,
                time: new Date()
            }
            namesCache.set(name, nameObject);
            res.status(response.status).json(response.result);
        }
        else res.status(response.status).json(response.result);

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