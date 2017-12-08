const express = require('express');
const app = express();
import { now, nowMulti, histDay, histDayMulti } from './dao/price';

app.get('/price/now', async (req, res)=>{
	const { fsym, tsym } = req.query;
	const price = await now(fsym, tsym);
	res.send(price);
});

app.get('/prices/now', async (req, res)=>{
	let { fsyms, tsyms } = req.query;
	fsyms = fsyms.split(',');
	tsyms = tsyms.split(',');
	const price = await nowMulti(fsyms, tsyms);
	res.send(price);
});

app.get('/price/historical', async (req, res)=>{
	let { fsym, tsym, start, end, format, period } = req.query;
	const price = await histDay(fsym, tsym, period, start, end, format);
	res.send(price);
});

app.get('/prices/historical', async (req, res)=>{
	let { fsyms, tsyms, start, end, format, period } = req.query;
	fsyms = fsyms.split(',');
	tsyms = tsyms.split(',');
	const price = await histDayMulti(fsyms, tsyms, period, start, end, format);
	res.send(price);
});

app.listen(3003, ()=>{
	console.log('listening on 3003');
})