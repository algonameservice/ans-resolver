const express = require('express');
const algosdk = require('algosdk');
const router = express.Router();

const helper = require('../helper/Algorand.js');

router.get('/:address', async function(req, res){
    const address = req.params.address;
    let isValidAddress = algosdk.isValidAddress(address);
    if(!isValidAddress) res.status(400).json({err: 'Invalid address'});
    else {
        
        const params = req.query;
        try{
            let addressInfo = await helper.lookupTransactionsByAddress(address, 
                params.socials === "true" ? params.socials : undefined, 
                params.metadata === "true" ? params.metadata : undefined );
            res.status(200).json({result:addressInfo});

        } catch (err) {
            res.status(400).json({err: err.message})
        }
    }
    
});

module.exports = router;
