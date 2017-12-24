import { escape, Precision } from 'influx';
import influx from '../lib/db';

const formatChart = (price={}) =>({
	x: +(price.time),
	y: Number(price.close)
})

const periodInterval = {
	'1d': '5m',
	'1w': '10m',
	'1m': '1d',
	'3m': '1d',
	'1y': '1d',
	'all': '1d'
}
const periodMap = {
	'1d': '1d',
	'1w': '1w',
	'1m': '31d',
	'3m': '93d',
	'1y': '366d',
	'all': '5000d'
}

export const now = async (fsym, tsym) => {
	const query = `
		select * from ticker_prices
		where fsym = ${escape.stringLit(fsym)} and tsym = ${escape.stringLit(tsym)}
		order by time desc
		limit 1
	`;
	console.log('now', query)
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	return {
		[fsym]: {
			[tsym]: rows[0]
		}
	};
}

export const nowMulti = async (fsyms, tsyms) => {
	const query = `
		select * from ticker_prices
		where fsym =~ /^${fsyms.join('$|^')}$/
		and tsym =~ /^${tsyms.join('$|^')}$/
		group by fsym,tsym
		order by time desc
		limit 1
	`;
	console.log('nowMulti', query)
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	const map = {};
	rows.forEach((row)=>{
		if (!map[row.fsym]) {
			map[row.fsym] = {};
		}
		map[row.fsym][row.tsym] = row;
	});
	return map;
}

const recent = async (fsym, tsym, period='1d') => {
	period = periodMap[period]
	const interval = interval || periodInterval[period] || '1d'
	const query = `
		select LAST(volume_24_hr) as volume, LAST(change_pct_24_hr) as change, LAST(market_cap) as market_cap, MAX(price) as high, MIN(price) as low, FIRST(price) as open, LAST(price) as close from ticker_prices
		where fsym = ${escape.stringLit(fsym)}
		and tsym = ${escape.stringLit(tsym)}
		and time > now() - ${period}
		group by time(${interval})
		order by time desc
	`;
	console.log('recent', query)
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	return {
		[fsym]: {
			[tsym]: rows
		}
	};
}

const recentMulti = async (fsyms, tsyms, period='1d') => {
	period = periodMap[period]
	const interval = interval || periodInterval[period] || '1d'
	const query = `
		select LAST(volume_24_hr) as volume, LAST(change_pct_24_hr) as change, LAST(market_cap) as market_cap, MAX(price) as high, MIN(price) as low, FIRST(price) as open, LAST(price) as close from ticker_prices
		where fsym =~ /^${fsyms.join('$|^')}$/
		and tsym =~ /^${tsyms.join('$|^')}$/
		and time > now() - ${period}
		group by fsym, tsym, time(${interval})
		order by time desc
	`;
	console.log('recentMulti', query)
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	const map = {};
	fsyms.forEach((fsym)=>{
		map[fsym] = {}
		tsyms.forEach((tsym)=>{
			map[fsym][tsym] = []
		})
	})
	rows.forEach((row)=>{
		map[row.fsym][row.tsym].push(row)
	});
	return map;
}

export const hist = async ({fsym, tsym, period='1d', interval, start=0, end=0, format='raw'}) => {
	if (period === '1d' || period === '1w') {
		return await recent(fsym, tsym, period)
	}
	start = new Date(Number(start));
	end = Number(end) ? new Date(Number(end)) : new Date();
	interval = interval || periodInterval[period] || '1d'
	period = periodMap[period]
	const dayStart = new Date((new Date().setHours(0,0,0,0)))
	const timeQuery = period ?
		period === '1d' ? 
		`and time >= ${escape.stringLit(dayStart.toISOString())}` : `and time > now() - ${period}`
		:
		`
		and time >= ${escape.stringLit(start.toISOString())}
		and time <= ${escape.stringLit(end.toISOString())}
		`
	const query = `
		select LAST(close) as close, LAST(high) as high, LAST(low) as low, LAST(open) as open from historical_prices
		where fsym = ${escape.stringLit(fsym)}
		and tsym = ${escape.stringLit(tsym)}
		${timeQuery}
		group by time(${interval})
		order by time asc
	`;
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	const map = {
		[fsym]: {
			[tsym]: []
		}
	};
	rows.forEach((row)=>{
		let price = row
		if (format === 'chart') {
			price = formatChart(row)
		}
		map[fsym][tsym].push(price)
	});
	return map;
}

export const histMulti = async ({fsyms, tsyms, period='1d', interval, start=0, end=0, format='raw'}) => {
	if (period === '1d' || period === '1w') {
		return await recentMulti(fsyms, tsyms, period)
	}
	start = new Date(Number(start));
	end = Number(end) ? new Date(Number(end)) : new Date();
	interval = interval || periodInterval[period] || '1d'
	period = periodMap[period]
	const dayStart = new Date((new Date().setHours(0,0,0,0)))
	const timeQuery = period ?
		period === '1d' ? 
		`and time >= ${escape.stringLit(dayStart.toISOString())}` : `and time > now() - ${period}`
		:
		`
		and time >= ${escape.stringLit(start.toISOString())}
		and time <= ${escape.stringLit(end.toISOString())}
		`
	const query = `
		select LAST(fsym) as fsym, LAST(tsym) as tsym, LAST(close) as close, LAST(high) as high, LAST(low) as low, LAST(open) as open from historical_prices
		where fsym =~ /^${fsyms.join('$|^')}$/
		and tsym =~ /^${tsyms.join('$|^')}$/
		${timeQuery}
		group by fsym, tsym, time(${interval})
		order by time asc
	`;
	console.log('histMulti', query)
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	const map = {};
	fsyms.forEach((fsym)=>{
		map[fsym] = {}
		tsyms.forEach((tsym)=>{
			map[fsym][tsym] = []
		})
	})
	rows.filter(r=>r.close).forEach((row)=>{
		let price = row
		if (format === 'chart') {
			price = formatChart(row)
		}
		map[row.fsym][row.tsym].push(price);
	});
	return map;
}