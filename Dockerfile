FROM node:carbon

ENV ENABLED_MARKETS=coinmarketcap
ENV DEFAULT_REQUEST_TIMEOUT=100
ENV DEFAULT_RESPONSE_TIMEOUT=5000
ENV MARKET_API_COINMARKETCAP_HOST=pro-api.coinmarketcap.com
ENV MARKET_API_COINMARKETCAP_TOKEN=__TOKEN__
#ENV MARKET_API_COINMARKETCAP_REQUEST_TIMEOUT=
#ENV MARKET_API_COINMARKETCAP_RESPONSE_TIMEOUT=
ENV ETH_ACCOUNT_PRIVATE_KEY=__KEY__
ENV ETH_PROVIDER=__PROVIDER__
ENV ETH_RATES_ADDRESS=__ADDRESS__
ENV CRON_SHEDULE='0 */5 * * *'

RUN apt-get update && apt-get -y install cron && \
    npm install npm@latest -g && npm -v && node -v

WORKDIR /app

COPY . .

RUN cp config.example.js config.js && \
    npm ci && \
    npm run build

RUN chmod 600 /etc/crontab && chmod +x ./start.sh
CMD ./start.sh


