const express = require('express');
const algosdk = require('algosdk');
const router = express.Router();

const helper = require('../helper/Algorand.js');
const Piscina = require('piscina');
const path = require('path');

const piscina = new Piscina({
  filename: path.resolve(__dirname, '../helper/getNamesOwnedByAddress.js')
});

const NodeCache = require('node-cache');

const namesCache = new NodeCache({
    stdTTL: 60*5,
    deleteOnExpire: true
});

router.get('/:address', async function(req, res){
    const address = req.params.address;
    let isValidAddress = algosdk.isValidAddress(address);
    
    if(!isValidAddress) res.status(400).json({err: 'Invalid address'});
    else {
        
        const params = req.query;
        
        try{
            let cachedResult = namesCache.get(address);
            let limit;
            try{
                if(params.limit !== undefined) {
                    limit = parseInt(params.limit);
                }
            } catch (err) {

            }
            if(cachedResult === undefined || limit !== 1 || params.socials !== undefined || params.metadata !== undefined ) {
                const response = await piscina.run(
                    {
                        address: address,
                        socials: params.socials === "true" ? params.socials : undefined, 
                        metadata: params.metadata === "true" ? params.metadata : undefined, 
                        limit:limit
                    }
                );

                if(limit === 1 && response.length > 0) {
                    namesCache.set(address, response);
                }
                res.status(200).json({result:response});

            } else {
                res.status(200).json({result: cachedResult});
            }
            

        } catch (err) {
            res.status(400).json({err: err.message})
        }
    }
    
});

module.exports = router;
