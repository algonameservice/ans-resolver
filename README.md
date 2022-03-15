# ans-resolver REST API 
Resolver .algo names and perform name operations on ANS .algo names.

## Resolve .algo name
Resolve .algo name to get the address of the owner. Use query params listed below to get further information including linked socials and other metadata.
### Method: GET
>```
>https://ansresolver.com/names/:name
>```
### Query Params:

|Param|value|
|---|---|
|socials|true (return socials along with name information)|
|metadata|true (return metadata along with name information)|

⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Names owned by address
Get all the names owned by and Algorand address. Use query parameters listed below to get more details about the name including linked socials and other metadata including avatar and transfer information.
### Method: GET
>```
>https://ansresolver.com/account/:address
>```
### Query Params:

|Param|value|
|---|---|
|socials|true (return socials along with name information)|
|metadata|true (return metadata along with name information)|
|limit|1 (limit the number of names to be returned)|


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Name Insights
This GET method returns ANS .algo name statistics including registrations, transfers, renewals, and more.
### Method: GET
>```
>https://ansresolver.com/names/insights
>```

<!--
⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Register new name
Get the transactions to be signed to register a .algo name.
### Method: POST
>```
>https://ansresolver.com/names/register/txns
>```
### Body (**raw**)

```json

{
    "name": "johndoe07.algo", 
    "address": "PRVIUNUJ2TIPL5PK5NFMPTUF2DQL5ZVU7IENDNNB2U4JEGW5FYCEQF2HOQ", 
    "period": 1 
}
```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Confirm registration
Sign and submit transactions to the network
### Method: POST
>```
>https://ansresolver.com/names/register/confirm
>```
### Body (**raw**)

```json

{
    "signedTxns": [] //The transactions signed by the user along with the opt-in transaction in order
}
```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Renew name
### Method: POST
>```
>https://ansresolver.com/names/renew
>```
### Body (**raw**)

```json

{
    "name": "johndoe07.algo", 
    "address": "PRVIUNUJ2TIPL5PK5NFMPTUF2DQL5ZVU7IENDNNB2U4JEGW5FYCEQF2HOQ",
    "period": 5
}
```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Update Name (Set KV Pairs)
Get the transactions to update the key value pairs associated with a .algo name
### Method: POST
>```
>https://ansresolver.com/names/update
>```
### Body (**raw**)

```json
/* Sample Body */
{
    "name": "johndoe07.algo", 
    "address": "PRVIUNUJ2TIPL5PK5NFMPTUF2DQL5ZVU7IENDNNB2U4JEGW5FYCEQF2HOQ", 
    "updatedHandles": {
        "twitter": "@johndoe",
        "discord": "johndoe#6711"
    }
}
```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Put name for transfer
Get the transaction to put your name for transfer by providing the new owner's address along with the price (in Algos) for which you are willing to accept the transfer
### Method: POST
>```
>https://ansresolver.com/names/put-for-transfer
>```
### Body (**raw**)

```json
{
    "name": "johndoe07.algo",
    "owner": "PRVIUNUJ2TIPL5PK5NFMPTUF2DQL5ZVU7IENDNNB2U4JEGW5FYCEQF2HOQ",
    "transfer_to": "G5EIF27LMQZPLJP45OYVNSCHIU4JQ2C2PERIDMHWDJOTIXBCZHBS4H5HCU",
    "price": 5
}
```


⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃ ⁃

## Accept transfer
Get the transactions to accept the transfer by providing previous owner's address, new owner's address and the price determined by the previous owner
### Method: POST
>```
>https://ansresolver.com/names/accept-transfer
>```
### Body (**raw**)

```json

{
    "name": "johndoe07.algo",
    "current_owner": "PRVIUNUJ2TIPL5PK5NFMPTUF2DQL5ZVU7IENDNNB2U4JEGW5FYCEQF2HOQ",
    "new_owner": "G5EIF27LMQZPLJP45OYVNSCHIU4JQ2C2PERIDMHWDJOTIXBCZHBS4H5HCU",
    "price": 5
}
```

-->


