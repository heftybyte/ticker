import { escape, Precision } from 'influx';
import influx from '../lib/db';

const formatChart = (prices) =>
	(prices || []).map((price)=>({
		x: price.price,
		y: price.time
	}))

export const now = async (fsym, tsym) => {
	const query = `
		select * from ticker_prices
		where fsym = ${escape.stringLit(fsym)} and tsym = ${escape.stringLit(tsym)}
		order by time desc
		limit 1
	`;
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
		where fsym =~ /${fsyms.join('|')}/
		and tsym =~ /${tsyms.join('|')}/
		group by fsym,tsym
		order by time desc
		limit 1
	`;
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

export const histDay = async (fsym, tsym, period='1d', start=0, end=0, format='price') => {
	start = new Date(Number(start));
	end = end ? new Date(Number(end)) : new Date();
	const query = `
		select * from historical_prices
		where fsym = ${escape.stringLit(fsym)}
		and tsym = ${escape.stringLit(tsym)}
		and high > 0
		and time >= ${escape.stringLit(start.toISOString())}
		and time <= ${escape.stringLit(end.toISOString())}
		order by time desc
	`;
	let err;
	const rows = await influx.query(query, { precision: Precision.Milliseconds }).catch(e=>err=e);
	if (err) {
		throw err;
	}
	const map = {
		[fsym]: {}
	};
	rows.forEach((row)=>{
		if (!map[fsym][row.tsym]) {
			map[row.fsym][row.tsym] = [];
		}
		if (format === 'chart') {
			row = formatChart(row)
		}
		map[row.fsym][row.tsym].push(row)
	});
	return map;
}

export const histDayMulti = async (fsyms, tsyms, period='1d', start=0, end=0, format='price') => {
	start = new Date(Number(start));
	end = end ? new Date(Number(end)) : new Date();
	const query = `
		select * from historical_prices
		where fsym =~ /${fsyms.join('|')}/
		and tsym =~ /${tsyms.join('|')}/
		and high > 0
		and time >= ${escape.stringLit(start.toISOString())}
		and time <= ${escape.stringLit(end.toISOString())}
		order by time desc
	`;
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
		if (!map[row.fsym][row.tsym]) {
			map[row.fsym][row.tsym] = [];
		}
		if (format === 'chart') {
			row = formatChart(row)
		}
		map[row.fsym][row.tsym].push(row);
	});
	return map;
}