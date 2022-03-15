const helper = require('./Algorand');

const getNamesOwnedByAddress = async ({address, socials, metadata, limit}) => {
    
    let addressInfo = await helper.lookupTransactionsByAddress(address, 
                socials,
                metadata,
                Number.isInteger(limit) ? limit : undefined );
    
    return addressInfo;
}

module.exports = getNamesOwnedByAddress;