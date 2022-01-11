const express = require('express');
const router = express.Router();
const algosdk = require('algosdk');

const helper = require('../helper/Algorand.js');

router.get('/:name', async function(req, res){

    let name = req.params.name;
    const params = req.query;
    name = name.split('.algo')[0];
    name = 'test-'+name;
    let result; 
    
    if(params.socials === 'true') {
        result = await helper.searchForName(name);
    }
    else {
        result = await helper.getAddress(name);
    }
    
    if(result.found) {
        res.status(200).json(result);
    }
    else {
        res.status(404).json(result);
    }
  
})

router.post('/register/txns', async function(req, res){
    let params = req.body;
    let name = params.name.split('.')[0];
    name = 'test-'+name;
    let address = params.address;
    
    let result;
    try{
        result = await helper.searchForName(name);
        console.log(result);
        if(!result.found) {
            const txns = await helper.createGroupTxns(name, address);
            res.json(txns);
        } else {
            res.json({success: false, error: 'Name already registered'})
        }
    }catch(err){
        
        res.json({success: false, error: err.message})
    }

})

router.post('/register/confirm', async function(req, res){

    let params = req.body;
    const signedTxns = params.signedTxns;

    if(signedTxns.length !== 5) res.status(400).json({success: false, error: `
        5 transactions expected. Received ${signedTxns.length}
    `})

    try{
        const confirm = await helper.sendTxnToNetwork(signedTxns);
        res.status(200).json(confirm);
    } catch(err) {
        res.status(400).json({success: false, error: err.message})
    }

})

router.get('/', function(req, res){
    res.status(400).send('Provide a name to lookup')
})

module.exports = router