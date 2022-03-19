const helper = require('./Algorand');
const NodeCache = require('node-cache');
const fs = require('fs');

const insightsCache = new NodeCache();

class Insights {
    
    nameInfo = {
        transactions: [],
        nameRegistrations: 0,
        nameTransfers: 0,
        latestPullTimestamp: '',
        totalTransactions: 0,
        lastTenRegistrations: [],
        nameRenewals: 0
    };

    addresses = {

    };

    LOCK = false;

    constructor () {
        if(! Insights.instance) {
            Insights.instance = this;
        }

        return Insights.instance;
    }

    loadTransactionsAfterTimestamp = async (timestamp, cacheObject) => {
        
        let info = await helper.lookupApplication(timestamp);
        for(let i=0; i<info.length; i++) {
            let args = info[i]["application-transaction"]["application-args"];
            
            if(args.length > 0) {
                if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                    
                    cacheObject.nameRegistrations++;
                    
                    if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                    else this.addresses[info[i].sender] = 1;
                
                    
                } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                    
                    cacheObject.nameTransfers++;
                    
                    if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                    else this.addresses[info[i].sender] = 1;
                    
                    
                } else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                    cacheObject.nameRenewals++;
                }
            } 
        }
        if(info.length > 0) {
            cacheObject.latestPullTimestamp = new Date();
            cacheObject.transactions = cacheObject.transactions.reverse();
            cacheObject.transactions = cacheObject.transactions.concat(info.reverse());
            cacheObject.transactions = cacheObject.transactions.reverse();
            cacheObject.transactions = cacheObject.transactions.slice(0,50);
        }

        return cacheObject;

    }

    loadInsights = async () => {
       
        let info;
        const insightsInfo = insightsCache.get("insights");
        let cacheObject = {};
        
        if(insightsInfo == undefined) {
            let data = fs.readFileSync('./src/data/data.json', 'utf-8');
            data = JSON.parse(data);
            cacheObject.transactions = data.transactions;
            cacheObject.totalTransactions = data.totalTransactions;
            cacheObject.nameRegistrations = data.nameRegistrations;
            cacheObject.nameTransfers = data.nameTransfers;
            cacheObject.nameRenewals = data.nameRenewals;
            cacheObject.latestPullTimestamp = data.timestamp;
            cacheObject.maxNamesOwnedByAddress = data.maxNamesOwnedByAddress;
            
            let latestData = await this.loadTransactionsAfterTimestamp(data.timestamp, cacheObject);
            cacheObject = {...latestData};

            /*
            let updatedJsonObject = {
                transactions: cacheObject.transactions,
                totalTransactions: cacheObject.totalTransactions,
                nameRegistrations: cacheObject.nameRegistrations,
                nameTransfers: cacheObject.nameTransfers,
                nameRenewals: cacheObject.nameRenewals,
                timestamp: new Date(),
                maxNamesOwnedByAddress: cacheObject.maxNamesOwnedByAddress
            }
            
            try{
                fs.writeFileSync('./src/data/data.json', JSON.stringify(updatedJsonObject));
            } catch (err) {
                return false;
            }
            */
            
        } else {
            cacheObject = {...insightsInfo};
            console.log(cacheObject);
            let latestData = await this.loadTransactionsAfterTimestamp(cacheObject.latestPullTimestamp, cacheObject);
            cacheObject = {...latestData};
        }

        let count = 0;
        let hex;
        let numberStr='';
        cacheObject.lastTenRegistrations = [];
        
        for(let i=0; i<cacheObject.transactions.length && count < 10; i++) {
            try{
                
                let args = cacheObject.transactions[i]["application-transaction"]["application-args"];
                let sender = cacheObject.transactions[i]["sender"];
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
                        
                        cacheObject.lastTenRegistrations.push(name);
                        count++;
                        

                    } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                        //TODO: Add to accept transfer array in the future
                        //cacheObject.nameTransfers++;
                    }
                    else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                        //TODO: Add to accept renew name array in the future
                        //cacheObject.nameRenewals++;
                    }
                } 
            } catch (err) {
                console.log("err");
            }
            
        }

        let maxNamesOwnedByAddress = cacheObject.maxNamesOwnedByAddress;
        for(let i in this.addresses) {
            if(this.addresses[i] > maxNamesOwnedByAddress) maxNamesOwnedByAddress = this.addresses[i];
        }
        cacheObject.maxNamesOwnedByAddress = maxNamesOwnedByAddress;

        insightsCache.set("insights", cacheObject);
        
    }

    getInsights = async () => {
        try{
            if(!this.LOCK){
                this.LOCK = true;
                const insights = await this.loadInsights();
                this.LOCK = false;
                const insightsInfo = insightsCache.get("insights");
                if(insightsInfo !== undefined) {
                    return ({
                        totalNameRegistrations : insightsInfo.nameRegistrations,
                        totalTransactions:insightsInfo.totalTransactions,
                        totalNameTransfers: insightsInfo.nameTransfers,
                        totalRenewals:insightsInfo.nameRenewals,
                        lastTenRegistrations: insightsInfo.lastTenRegistrations,
                        maxNamesOwnedByAddress: insightsInfo.maxNamesOwnedByAddress
                    });
                } else {
                    return false;
                }
            } else {
                const insightsInfo = insightsCache.get("insights");
                if(insightsInfo !== undefined) {
                    return ({
                        totalNameRegistrations : insightsInfo.nameRegistrations,
                        totalTransactions:insightsInfo.totalTransactions,
                        totalNameTransfers: insightsInfo.nameTransfers,
                        totalRenewals:insightsInfo.nameRenewals,
                        lastTenRegistrations: insightsInfo.lastTenRegistrations,
                        maxNamesOwnedByAddress: insightsInfo.maxNamesOwnedByAddress
                    });
                } else {
                    return false;
                }
            }
        } catch (err) {

        } finally {
            this.LOCK = false;
        }
        
        
    }
}

module.exports = Insights;