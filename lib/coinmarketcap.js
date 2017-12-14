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
	console.log('response')
	// console.log(Object.keys(response))
	console.log(typeof JSON.parse(response))
	// process.exit(0);
	return JSON.parse(response)

}

// ticker({limit: 10})

