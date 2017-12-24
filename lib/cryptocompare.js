import request from './request';

const baseUrl = 'https://min-api.cryptocompare.com/data/'

function dateToTimestamp (date) {
  if (!(date instanceof Date)) throw new Error('timestamp must be an instance of Date.')
  return Math.floor(date.getTime() / 1000)
}

export const priceFull = async (fsyms, tsyms, options) => {
	let url = `${baseUrl}pricemultifull?fsyms=${fsyms}&tsyms=${tsyms}`

	options = options || {}
	if (options.exchanges) url += `&e=${options.exchanges}`
  	if (options.tryConversion === false) url += '&tryConversion=false'

	let response = await request.get({url: url});
	let result = JSON.parse(response);

	if (result.Response === 'Error') throw result.Message

	return result.RAW;
};


export const histoDay  = async (fsym, tsym, options) => {
  options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histoday?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (!options.limit) url += '&allData=true'
  else if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`

  let response = await request.get({url: url});
  let result = JSON.parse(response)
  
  if (result.Response === 'Error') throw result.Message

  return result.Data;


}

export const histoMinute = async (fsym, tsym, options) => {
  options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histominute?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (!options.limit) url += '&allData=true'
  else if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`

  let response = await request.get({url: url});
  let result = JSON.parse(response)

  if (result.Response === 'Error') throw result.Message

  return result.Data;
}


export const histoHour = async (fsym, tsym, options) => {
options = options || {}
  if (options.timestamp) options.timestamp = dateToTimestamp(options.timestamp)
  let url = `${baseUrl}histohour?fsym=${fsym}&tsym=${tsym}`
  if (options.exchange) url += `&e=${options.exchange}`
  if (!options.limit) url += '&allData=true'
  else if (options.limit) url += `&limit=${options.limit}`
  if (options.tryConversion === false) url += '&tryConversion=false'
  if (options.aggregate) url += `&aggregate=${options.aggregate}`
  if (options.timestamp) url += `&toTs=${options.timestamp}`

  let response = await request.get({url: url});
  let result = JSON.parse(response)
  
  if (result.Response === 'Error') throw result.Message

  return result.Data;

}



