const helper = require('./Algorand');

let Insights = (function () {
    let instance;
    let LOCK = false;
    let nameInfo = {
        transactions: [],
        nameRegistrations: 0,
        nameTransfers: 0,
        latestPullTimestamp: '',
        totalTransactions: 0,
        lastTenRegistrations: [],
        nameRenewals: 0
    };
    let addresses = {

    };


    function createInstance() {
        let object = new Object();
        return object;
    }

    async function loadInsights(){

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

        return ({
            totalNameRegistrations: nameInfo.nameRegistrations,
            totalTransactions: nameInfo.totalTransactions, 
            totalNameTransfers: nameInfo.nameTransfers,
            lastTenRegistrations: nameInfo.lastTenRegistrations,
            addresses: addresses,
            totalRenewals: nameInfo.nameRenewals
        })

    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        },
        getInsights: async function (){
            let info = await loadInsights();
            return info;
        }
    };
})();

async function run(){

    let info = await Insights.getInsights();
    
}

run();