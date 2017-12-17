import request from './request';

export const ticker = async(options) => {
	console.log(options)
	let query = "";
	for(let option in options){
		query += option+"="+options[option]+"&"
	}
	console.log(query);
	const url = 'https://api.coinmarketcap.com/v1/ticker/?'+query
	let response = await request.get({url: url});
	return JSON.parse(response)
}
