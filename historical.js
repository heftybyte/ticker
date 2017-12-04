// required by cryptocompare
global.fetch = require('node-fetch');

const cc = require('cryptocompare');
const TSYMS = require('./data/tsyms');
const TOKENS = require('./data/tokens');
const FSYMS = Object.keys(TOKENS);
const Promise = require('bluebird');

import { Precision } from 'influx';
import db from './lib/db';

const periodMeasurements = {
	'day': 'historical_prices',
	'minute': 'historical_prices_minute',
	'hour': 'historical_prices_hour'
};

const histFn = {
	'day': cc.histoDay,
	'minute': cc.histoMinute,
	'hour': cc.histoHour
};

const periodInterval = {
	'day': 3600 * 24 * 1000,
	'minute': 60 * 1000 * 5,
	'hour': 3600 * 1000
};

const periodTsyms = {
	'day': TSYMS,
	'minute': ['USD'],
	'hour': ['USD']
};

const storeHistoricalPrice = async({fsym, tsym, period='day'}) => {
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

const storeHistoricalPrices = async (period='day') =>{
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
const period = process.argv[2] || 'day';
const interval = periodInterval[period];

console.log({period, interval});

setInterval(()=>{
	storeHistoricalPrices(period);
}, interval);
storeHistoricalPrices(period);
