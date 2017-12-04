// required by cryptocompare
global.fetch = require('node-fetch');

const cc = require('cryptocompare');
const TSYMS = require('./data/tsyms');
const TOKENS = require('./data/tokens');
const FSYMS = Object.keys(TOKENS);
const Promise = require('bluebird');

import { Precision } from 'influx';
import db from './lib/db';

const storeHistoricalPrice = async({fsym, tsym}) => {
	let err;
	const prices = await cc.histoDay(fsym, tsym, { limit: 2000 }).catch(e=>err=e);

	if (err) {
		console.error(`storeHistoricalPrice:: ${fsym}->${tsym} an error occurred`, err)
		return false;
	}

	const points = prices.map(price=>({
		measurement: 'historical_prices',
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

const storeHistoricalPrices = async () =>{
	const pairs = [];
	for (let i = 0; i < TSYMS.length; i++) {
		for (let j = 0; j < FSYMS.length; j++) {
			pairs.push({
				fsym: FSYMS[j],
				tsym: TSYMS[i]
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

storeHistoricalPrices();