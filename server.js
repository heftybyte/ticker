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

app.get('/price/histday', async (req, res)=>{
	let { fsym, tsyms, start, end } = req.query;
	tsyms = tsyms.split(',');
	const price = await histDay(fsym, tsyms, start, end);
	res.send(price);
});

app.get('/prices/histday', async (req, res)=>{
	let { fsyms, tsyms, start, end } = req.query;
	fsyms = fsyms.split(',');
	tsyms = tsyms.split(',');
	const price = await histDayMulti(fsyms, tsyms, start, end);
	res.send(price);
});

app.listen(3003, ()=>{
	console.log('listening on 3003');
})