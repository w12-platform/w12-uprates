const markets = process.env.ENABLED_MARKETS
    .split(',')
    .map(i => i.trim())
    .filter(Boolean);
const defaultRequestTimeout = process.env.DEFAULT_RESPONSE_TIMEOUT || '0';
const defaultResponseTimeout = process.env.DEFAULT_RESPONSE_TIMEOUT || '2000';

module.exports = {
    markets: [
        {
            moduleName: 'coinmarketcap',
            host: process.env.MARKET_API_COINMARKETCAP_HOST,
            token: process.env.MARKET_API_COINMARKETCAP_TOKEN,
            enabled: markets.includes('coinmarketcap'),
            requestTimeout: process.env.MARKET_API_COINMARKETCAP_REQUEST_TIMEOUT || defaultRequestTimeout,
            responseTimeout: process.env.MARKET_API_COINMARKETCAP_RESPONSE_TIMEOUT || defaultResponseTimeout,
        }
    ],
    ethAccountPrivateKey: process.env.ETH_ACCOUNT_PRIVATE_KEY,
    ethProvider: process.env.ETH_PROVIDER,
    ethRatesAddress: process.env.ETH_RATES_ADDRESS
};
