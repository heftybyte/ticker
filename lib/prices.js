// required by cryptocompare
global.fetch = require('node-fetch');

const coinmarketcap = require('coinmarketcap');
const cc = require('cryptocompare');
const Promise = require('bluebird')
const _ = require('lodash');

const TOKENS = require('../data/tokens');
const TOKEN_ID_BLACKLIST = require('../data/token-id-blacklist');
const TSYMS = require('../data/tsyms');

export const COIN_MARKETCAP = 'coinmarketcap';
export const CRYPTO_COMPARE = 'cryptocompare';
export const SOURCES = [COIN_MARKETCAP, CRYPTO_COMPARE];

const influx = require('influx');

const getPricesFromCoinMarketCap = async (tsym) => {
  let err;
  const prices = {};
  let currencies = await coinmarketcap.ticker({
    limit: 0,
    convert: tsym,
  }).catch(e=>err = e);

  if (err) {
    console.log('getPricesFromCoinMarketCap error', err);
    throw err;
  }

  currencies = currencies.filter(
    currency => TOKENS[currency.symbol] && !TOKEN_ID_BLACKLIST[currency.id]);
  currencies.forEach((currency) => {
    prices[currency.symbol] = {
      symbol: currency.symbol,
      price: Number(currency['price_usd']) || 0,
      change: Number(currency['percent_change_24h']) || 0,
      change7d: Number(currency['percent_change_7d']) || 0,
      period: '24h',
      marketCap: Number(currency['market_cap_usd']) || 0,
      volume24Hr: Number(currency['24h_volume_usd']) || 0,
      supply: Number(currency['available_supply']) || 0,
      timestamp: Number(currency['last_updated'] || 0)
    };
  });
  return prices;
};

const getPricesFromCryptoCompare = async (tsym) => {
  let err;
  const batchSize = 50;
  const prices = {};
  let symbols = Object.keys(TOKENS);
  const numBatches = Math.floor(symbols.length / batchSize);
  const batches = [];

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    if (batch.length) {
      batches.push(batch);
    } else {
      console.log('no symbols in batch', i);
    }
  }

  const results = await Promise.map(
    batches,
    (batch) => cc.priceFull(batch, tsym),
    { concurrency: 3 }
  ).catch(e=>err=e)

  if (err) {
    throw err 
  }
  const priceData = results.reduce((acc, curr)=>_.merge(acc, curr), {});
  symbols.forEach(symbol=>{
    if (!priceData[symbol] || !priceData[symbol][tsym]) {
      // console.log('no price data for', symbol, 'to', tsym, priceData[symbol]);
      return;
    }
    const priceInfo = priceData[symbol][tsym];
    prices[symbol] = {
	    symbol,
      price: Number(priceInfo['PRICE']) || 0,
      change: Number(priceInfo['CHANGEPCT24HOUR']) || 0,
      period: '24h',
      marketCap: Number(priceInfo['MKTCAP']) || 0,
      volume24Hr: Number(priceInfo['TOTALVOLUME24H']) || 0,
      supply: Number(priceInfo['SUPPLY']) || 0,
      timestamp: Number(priceInfo['LASTUPDATE'])
    };
  });
  return prices;
};

export const getPricesForSymbol = async (tsym) => {
  console.log(`getting prices for ${tsym}`)

  let err;
  const rawPrices = await Promise.all([
    getPricesFromCoinMarketCap(tsym),
    getPricesFromCryptoCompare(tsym)
  ]).catch(e=>err=e);

  if (err) {
    console.log({err})
    throw(err)
  }
  console.log(`Got prices for ${tsym}`)

  const cmcPrices = rawPrices[0];
  const ccPrices =rawPrices[1];
  const cmcSymbols = Object.keys(cmcPrices);
  const ccSymbols = Object.keys(ccPrices);
  const symbols = [...cmcSymbols].concat(ccSymbols.filter(symbol=>!cmcPrices[symbol]));

  const prices = symbols.map(fsym => {
    const priceData = ccPrices[fsym] || cmcPrices[fsym] || {};
    return {
      fsym,
      tsym,
      timestamp: priceData.timestamp,
      price: priceData.price,
      volume_24_hr: priceData.volume24Hr,
      change_pct_24_hr: priceData.change,
      market_cap: priceData.marketCap,
    }
  });

  return prices;
}

export const getPrices = async () => {
  console.log('getting prices for', TSYMS.join(', '))
  const start = new Date()
  const prices = await Promise.map(TSYMS, getPricesForSymbol, { concurrency: 2 });
  console.log(`got all prices in ${(Date.now()-start)/1000}s`)
  return prices.reduce((acc, curr)=>acc.concat(curr), []);
};
