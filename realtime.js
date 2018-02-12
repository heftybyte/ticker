import {} from 'dotenv/config'
import { Precision } from 'influx';
import {setInterval} from 'timers';
import {getPrices} from './lib/prices';
import db from './lib/db';

const pollDuration = process.env.POLL_DURATION || 30000;

const storeCurrentPrices = async () => {
	const prices = await getPrices();
	// console.log('got prices', prices);
	const points = prices.map(price=>({
		measurement: 'ticker_prices',
		tags: {
			fsym: price.fsym,
			tsym: price.tsym
		},
		fields: {
			price: price.price,
			volume_24_hr: price.volume_24_hr,
			change_pct_24_hr: price.change_pct_24_hr,
			market_cap: price.market_cap,
			supply: price.supply
		},
		timestamp: price.timestamp
	}));

	console.log(`saving ${points.length} price points`);

	let err;
	await db.writePoints(points, { precision: Precision.Seconds }).catch(e=>err=e);

	if (err) {
		console.error('an error occured', err);
	} else {
		console.log(`saved ${points.length} price points`);
	}
}

storeCurrentPrices();
setInterval(storeCurrentPrices, pollDuration);