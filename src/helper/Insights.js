const helper = require('./Algorand');

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

    loadInsights = async () => {
       
        let info;
        
        if(this.nameInfo.transactions.length === 0) {
            info = await helper.lookupApplication();
            this.nameInfo.totalTransactions = info.length;
            this.nameInfo.transactions = info.slice(0,50);
            this.nameInfo.latestPullTimestamp = new Date();
         
            for(let i=0; i<info.length; i++) {
                let args = info[i]["application-transaction"]["application-args"];
                if(args.length > 0) {
                    if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                        this.nameInfo.nameRegistrations++;
                        if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                        else this.addresses[info[i].sender] = 1;
                    } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                        this.nameInfo.nameTransfers++;
                        if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                        else this.addresses[info[i].sender] = 1;
                    }
                    else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                        this.nameInfo.nameRenewals++;
                    }
                } 
            }
            
        } else {
            
            info = await helper.lookupApplication(this.nameInfo.latestPullTimestamp);
            this.nameInfo.totalTransactions += info.length;
            
            for(let i=0; i<info.length; i++) {
                let args = info[i]["application-transaction"]["application-args"];
                
                if(args.length > 0) {
                    if(Buffer.from(args[0], 'base64').toString() === 'register_name'){
                        
                        this.nameInfo.nameRegistrations++;
                        
                        if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                        else this.addresses[info[i].sender] = 1;
                    
                        
                    } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                        
                        this.nameInfo.nameTransfers++;
                        
                        if(this.addresses[info[i].sender] !== undefined) this.addresses[info[i].sender]++;
                        else this.addresses[info[i].sender] = 1;
                        
                        
                    } else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                        this.nameInfo.nameRenewals++;
                    }
                } 
            }
            if(info.length > 0) {
                this.nameInfo.latestPullTimestamp = new Date();
                this.nameInfo.transactions = this.nameInfo.transactions.reverse();
                this.nameInfo.transactions = this.nameInfo.transactions.concat(info.reverse());
                this.nameInfo.transactions = this.nameInfo.transactions.reverse();

            }
               
        }

        let count = 0;
        let hex;
        let numberStr='';
        this.nameInfo.lastTenRegistrations = [];
        
        
        for(let i=0; i<this.nameInfo.transactions.length && count < 10; i++) {
            try{
                
                let args = this.nameInfo.transactions[i]["application-transaction"]["application-args"];
                let sender = this.nameInfo.transactions[i]["sender"];
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
                        
                        this.nameInfo.lastTenRegistrations.push(name);
                        count++;

                        
                        
                    } else if(Buffer.from(args[0], 'base64').toString() === 'accept_transfer') {
                        this.nameInfo.nameTransfers++;
                    }
                    else if(Buffer.from(args[0], 'base64').toString() === 'renew_name') {
                        this.nameInfo.nameRenewals++;
                    }
                } 
            } catch (err) {
                console.log(err);
            }
            
        }

    }

    getInsights = async () => {
        try{
            if(!this.LOCK){
                this.LOCK = true;
                await this.loadInsights();
                this.LOCK = false;
                return ({
                    totalNameRegistrations: this.nameInfo.nameRegistrations,
                    totalTransactions: this.nameInfo.totalTransactions, 
                    totalNameTransfers: this.nameInfo.nameTransfers,
                    lastTenRegistrations: this.nameInfo.lastTenRegistrations,
                    addresses: this.addresses,
                    totalRenewals: this.nameInfo.nameRenewals
                })
            } else {
                return ({
                    totalNameRegistrations: this.nameInfo.nameRegistrations,
                    totalTransactions: this.nameInfo.totalTransactions, 
                    totalNameTransfers: this.nameInfo.nameTransfers,
                    lastTenRegistrations: this.nameInfo.lastTenRegistrations,
                    addresses: this.addresses,
                    totalRenewals: this.nameInfo.nameRenewals
                })
            }
        } catch (err) {

        } finally {
            this.LOCK = false;
        }
        
        
    }
}

module.exports = Insights;