const Influx = require('influx');
import influx from '../lib/db';

export const now = async (fsym, tsym) => {
	const query = `
		select * from ticker_prices
		where fsym = ${Influx.escape.stringLit(fsym)} and tsym = ${Influx.escape.stringLit(tsym)}
		order by time desc
		limit 1
	`;
	let err;
	const rows = await influx.query(query).catch(e=>err=e);
	if (err) {
		throw err;
	}
	return rows[0];
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
	const rows = await influx.query(query).catch(e=>err=e);
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

export const histDay = async (fsym, tsyms) => {
	const query = `
		select * from historical_prices
		where fsym = ${Influx.escape.stringLit(fsym)}
		and tsym =~ /${tsyms.join('|')}/
		and high > 0
		order by time desc
	`;
	let err;
	const rows = await influx.query(query).catch(e=>err=e);
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
		map[row.fsym][row.tsym].push(row);
	});
	return map;
}

export const histDayMulti = async (fsyms, tsyms) => {
	const query = `
		select * from historical_prices
		where fsym =~ /${fsyms.join('|')}/
		and tsym =~ /${tsyms.join('|')}/
		and high > 0
		order by time desc
	`;
	let err;
	const rows = await influx.query(query).catch(e=>err=e);
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
		map[row.fsym][row.tsym].push(row);
	});
	return map;
}