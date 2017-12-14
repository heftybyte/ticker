const r = require('request-promise');

const username = "esco"
const password = "JBLLj4bxLGFTtxereLbt"
const proxyUrl = `http://${username}:${password}@us-wa.proxymesh.com:31280`

const options = {
	'proxy': proxyUrl,
	// json: true
}

const request = r.defaults(options)

export default request;
// r.get('http://www.xhaus.com/headers', function (error, response, body) {
//     console.log(body) 
// });