const Influx = require('influx');
const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  port: process.env.INFLUX_PORT || 8086,
  database: process.env.INFLUX_DB || 'prices',
  username: process.env.INFLUX_USERNAME || '',
  password: process.env.INFLUX_PASSWORD || '',
  protocol: process.env.INFLUX_PROTOCOL || 'http',
  schema: [
    {
      measurement: 'ticker_prices',
      fields: {
        price: Influx.FieldType.FLOAT,
        volume_24_hr: Influx.FieldType.FLOAT,
        change_pct_24_hr: Influx.FieldType.FLOAT,
        market_cap: Influx.FieldType.FLOAT,
        supply: Influx.FieldType.INTEGER
      },
      tags: [
        'fsym',
        'tsym'
      ]
    },
    {
      measurement: 'historical_prices',
      fields: {
        open: Influx.FieldType.FLOAT,
        close: Influx.FieldType.FLOAT,
        high: Influx.FieldType.FLOAT,
        low: Influx.FieldType.FLOAT
      },
      tags: [
        'fsym',
        'tsym'
      ]
    }
  ]
});

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('prices')) {
      return influx.createDatabase('prices');
    }
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  })

influx.ping(5000).then(hosts => {
  hosts.forEach(host => {
    if (host.online) {
      console.log(`${host.url.host} responded in ${host.rtt}ms running ${host.version})`)
    } else {
      console.log(`${host.url.host} is offline :(`)
    }
  })
})

export default influx;