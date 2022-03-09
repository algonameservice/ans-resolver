
const helper = require('./Algorand');

const resolveName = async (name, params) => {
    
    let nameInfo = {};
    
    if(params === undefined || Object.keys(params).length === 0) {
        
        let result = await helper.getAddress(name);
        if(result.found) {            
            nameInfo.status = 200;
            nameInfo.result = result;
            
        }
        else {
            nameInfo.status = 400;
            nameInfo.result = result;
        } 
    }
    
    else {
        
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
            
            nameInfo.status = 200;
            nameInfo.result = result;
            
        }
        else {
            nameInfo.status = 400;
            nameInfo.result = result;
        }
    }

    return nameInfo;
    
};

module.exports = resolveName;