# W12 Uprates

This script for scheduling price updating for [Rates.sol](https://github.com/w12-platform/W12-Product-Blockchain-Protocol/blob/master/contracts/rates/Rates.sol) contract.

# Development

```bash
// install dependencies
$ npm install
```

# Configuration

Copy and rename `example.config.js` to `config.js`, it\`s main config. In Additional you may copy and rename `.env.example` to `.env` to load env var from file.

```bash

# list of enabled markets to do price request separated with ','
# availables: coinmarketcap
ENABLED_MARKETS=coinmarketcap
# defalt timeout before to do request
DEFAULT_REQUEST_TIMEOUT=100
# default response timeout from market api
DEFAULT_RESPONSE_TIMEOUT=5000
# coinmarketcap host
MARKET_API_COINMARKETCAP_HOST=pro-api.coinmarketcap.com
# coinmarketcap api auth token
MARKET_API_COINMARKETCAP_TOKEN=__TOKEN__
# timeout before do request to coinmarketcap
MARKET_API_COINMARKETCAP_REQUEST_TIMEOUT=<DEFAULT_REQUEST_TIMEOUT>
# response timeout from coinmarketcap api
MARKET_API_COINMARKETCAP_RESPONSE_TIMEOUT=<DEFAULT_RESPONSE_TIMEOUT>
# private key of account with 0x at beginning
ETH_ACCOUNT_PRIVATE_KEY=
# http provider for web3
ETH_PROVIDER=https://ropsten.infura.io/v3/{key}
# address of the rates contract
ETH_RATES_ADDRESS=__ADDRESS__

# additional (only for docker)

# cron shedule expression. run the update rates script every * * * * *
CRON_SHEDULE='0-59 * * * *'
```



