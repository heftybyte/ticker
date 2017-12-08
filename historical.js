// required by cryptocompare
global.fetch = require('node-fetch');

const cc = require('cryptocompare');
const TSYMS = require('./data/tsyms');
const TOKENS = require('./data/tokens');
const FSYMS = Object.keys(TOKENS);
const Promise = require('bluebird');

import { Precision } from 'influx';
import db from './lib/db';

export const periodMeasurements = {
	'1d': 'historical_prices',
	'1m': 'historical_prices_minute',
	'1h': 'historical_prices_hour'
};

export const histFn = {
	'1d': cc.histoDay,
	'1m': cc.histoMinute,
	'1h': cc.histoHour
};

export const periodInterval = {
	'1d': 3600 * 24 * 1000,
	'1m': 60 * 1000 * 10,
	'1h': 3600 * 1000
};

export const periodTsyms = {
	'1d': TSYMS,
	'1m': ['USD'],
	'1h': ['USD']
};

const storeHistoricalPrice = async({fsym, tsym, period='1d'}) => {
	let err;
	const prices = await histFn[period](fsym, tsym, { limit: 2000 }).catch(e=>err=e);

	if (err) {
		console.error(`storeHistoricalPrice:: ${fsym}->${tsym} an error occurred`, err)
		return false;
	}

	const points = prices.map(price=>({
		measurement: periodMeasurements[period],
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

const storeHistoricalPrices = async (period='1d') =>{
	const pairs = [];
	const tsyms = periodTsyms[period];
	for (let i = 0; i < tsyms.length; i++) {
		for (let j = 0; j < FSYMS.length; j++) {
			pairs.push({
				fsym: FSYMS[j],
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
const interval = periodInterval[period];

console.log({period, interval});

setInterval(()=>{
	storeHistoricalPrices(period);
}, interval);
storeHistoricalPrices(period);
