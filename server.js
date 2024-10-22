import {} from 'dotenv/config'
const express = require('express');
const app = express();
import { now, nowMulti, hist, histMulti } from './services/price';

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
	let { fsym, tsym, start, end, format, period, interval } = req.query;
	const price = await hist({fsym, tsym, period, interval, start, end, format});
	res.send(price);
});

app.get('/prices/historical', async (req, res)=>{
	let { fsyms, tsyms, start, end, format, period, interval } = req.query;
	fsyms = fsyms.split(',');
	tsyms = tsyms.split(',');
	const price = await histMulti({fsyms, tsyms, period, interval, start, end, format});
	res.send(price);
});

app.get('/health', (req, res)=>{
	res.sendStatus(200)
})

const PORT = process.env.PORT || 3003;
app.listen(PORT, ()=>{
	console.log(`listening on ${PORT}`);
})
