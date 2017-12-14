'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Influx = require('influx');
var influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  port: process.env.INFLUX_PORT || 8086,
  database: process.env.INFLUX_DB || 'prices',
  username: process.env.INFLUX_USERNAME || '',
  password: process.env.INFLUX_PASSWORD || '',
  schema: [{
    measurement: 'ticker_prices',
    fields: {
      price: Influx.FieldType.FLOAT,
      volume_24_hr: Influx.FieldType.FLOAT,
      change_pct_24_hr: Influx.FieldType.FLOAT,
      market_cap: Influx.FieldType.FLOAT
    },
    tags: ['fsym', 'tsym']
  }, {
    measurement: 'historical_prices',
    fields: {
      open: Influx.FieldType.FLOAT,
      close: Influx.FieldType.FLOAT,
      high: Influx.FieldType.FLOAT,
      low: Influx.FieldType.FLOAT
    },
    tags: ['fsym', 'tsym']
  }, {
    measurement: 'historical_prices_hour',
    fields: {
      open: Influx.FieldType.FLOAT,
      close: Influx.FieldType.FLOAT,
      high: Influx.FieldType.FLOAT,
      low: Influx.FieldType.FLOAT
    },
    tags: ['fsym', 'tsym']
  }, {
    measurement: 'historical_prices_minute',
    fields: {
      open: Influx.FieldType.FLOAT,
      close: Influx.FieldType.FLOAT,
      high: Influx.FieldType.FLOAT,
      low: Influx.FieldType.FLOAT
    },
    tags: ['fsym', 'tsym']
  }]
});

exports.default = influx;