const express = require('express');

const router = express.Router();

const helper = require('../helper/Algorand.js');
const Piscina = require('piscina');
const path = require('path');

const piscina = new Piscina({
  filename: path.resolve(__dirname, '../helper/getNamesOwnedByAddress.js'),
});

const NodeCache = require('node-cache');
const { isValidAddress } = require('algosdk');

const namesCache = new NodeCache({
  stdTTL: 60 * 5,
  deleteOnExpire: true,
});

router.get('/:address', async function (req, res) {
  const { address } = req.params;

  if (!isValidAddress(address))
    res.status(400).json({ err: 'Invalid address' });
  else {
    const params = req.query;

    try {
      const cachedResult = namesCache.get(address);
      let limit;
      try {
        if (params.limit !== undefined) {
          limit = parseInt(params.limit);
        }
      } catch (err) {}
      if (
        cachedResult === undefined ||
        limit !== 1 ||
        params.socials !== undefined ||
        params.metadata !== undefined
      ) {
        const response = await piscina.run({
          address,
          socials: params.socials === 'true' ? params.socials : undefined,
          metadata: params.metadata === 'true' ? params.metadata : undefined,
          limit,
        });

        if (limit === 1 && response.length > 0) {
          namesCache.set(address, response);
        }
        res.status(200).json({ result: response });
      } else {
        res.status(200).json({ result: cachedResult });
      }
    } catch (err) {
      res.status(400).json({ err: err.message });
    }
  }
});

router.get('/', async function (req, res) {
  const { accounts } = req.query;
  const domains = {};
  try {
    if (!accounts || accounts.length === 0)
      res.status(400).json({ err: 'Send an array of accounts' });
    for (const i in accounts) {
      const account = accounts[i];
      if (isValidAddress(account)) {
        const response = await piscina.run({
          address: account,
          limit: 1,
        });
        if (response.length > 0) {
          domains[account] = response[0].name;
        }
      }
    }
  } catch (err) {}
  res.status(200).json(domains);
});

module.exports = router;
