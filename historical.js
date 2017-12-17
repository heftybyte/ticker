// required by cryptocompare
import {} from 'dotenv/config'

global.fetch = require('node-fetch');

const cc = require('cryptocompare');
const proxy_cc = require('./lib/cryptocompare');

const TSYMS = require('./data/tsyms');
const TOKENS = require('./data/tokens');
const FSYMS = Object.keys(TOKENS);
const Promise = require('bluebird');

import { Precision } from 'influx';
import db from './lib/db';

const MEASUREMENT = 'historical_prices'

export const histFn = {
	'1d': proxy_cc.histoDay,
	'1m': proxy_cc.histoMinute,
	'1h': proxy_cc.histoHour
};

export const periodInterval = {
	'1d': 3600 * 12 * 1000,
	'1m': 60 * 1000 * 5,
	'1h': 1800 * 1000	
};

export const periodTsyms = {
	'1d': TSYMS,
	'1m': ['USD'],
	'1h': ['USD']
};

const storeHistoricalPrice = async({fsym, tsym, period='1d'}) => {
	let err;
	const prices = await histFn[period](fsym, tsym, { limit: 2000 }).catch(e=>err=e);
	// process.exit(0)

	if (err) {
		console.error(`storeHistoricalPrice:: ${fsym}->${tsym} an error occurred`, err)
		return false;
	}

	const points = prices.filter(p=>p.close).map(price=>({
		measurement: MEASUREMENT,
		tags: { fsym, tsym },
		fields: {
			open: price.open,
			close: price.close,
			high: price.high,
			low: price.low
		},
		timestamp: price.time
	}));

	console.log(`saving ${points.length} historical price points for ${fsym}->${tsym}`);

	await db.writePoints(points, { precision: Precision.Seconds }).catch(e=>err=e);

	if (err) {
		console.error('an error occured', err);
		return false;
	} else {
		console.log(`saved ${points.length} historical price points for ${fsym}->${tsym}`);
		return true;
	}
}

const storeHistoricalPrices = async (period='1d', fsyms=FSYMS, tsyms=TSYMS) =>{
	const pairs = [];
	for (let i = 0; i < tsyms.length; i++) {
		for (let j = 0; j < fsyms.length; j++) {
			pairs.push({
				fsym: fsyms[j],
				tsym: tsyms[i],
				period
			});
		}
	}
	let err;
	const results = await Promise.map(pairs, storeHistoricalPrice, { concurrency: 4 }).catch(e=>err=e)
	if (err) {
		console.error('an error occured', err);
	} else {
		console.log('finished', results.length);
	}
}
const period = process.argv[2] || '1d';
const fsyms = process.argv[3] ? process.argv[3].split(',') : FSYMS;
const tsyms = process.argv[4] ? process.argv[4].split(',') : periodTsyms[period];
const interval = periodInterval[period];

console.log('fetching historical price data for', {period, interval, fsyms, tsyms});

setInterval(()=>{
	storeHistoricalPrices(period, fsyms, tsyms);
}, interval);
storeHistoricalPrices(period, fsyms, tsyms);
