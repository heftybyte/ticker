'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrices = exports.getPricesForSymbol = exports.SOURCES = exports.CRYPTO_COMPARE = exports.COIN_MARKETCAP = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// required by cryptocompare
global.fetch = require('node-fetch');

var coinmarketcap = require('coinmarketcap');
var cc = require('cryptocompare');
var Promise = require('bluebird');
var _ = require('lodash');

var TOKENS = require('../data/tokens');
var TOKEN_ID_BLACKLIST = require('../data/token-id-blacklist');
var TSYMS = require('../data/tsyms');

var COIN_MARKETCAP = exports.COIN_MARKETCAP = 'coinmarketcap';
var CRYPTO_COMPARE = exports.CRYPTO_COMPARE = 'cryptocompare';
var SOURCES = exports.SOURCES = [COIN_MARKETCAP, CRYPTO_COMPARE];

var influx = require('influx');

var getPricesFromCoinMarketCap = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(tsym) {
    var err, prices, currencies;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            err = void 0;
            prices = {};
            _context.next = 4;
            return coinmarketcap.ticker({
              limit: 0,
              convert: tsym
            }).catch(function (e) {
              return err = e;
            });

          case 4:
            currencies = _context.sent;

            if (!err) {
              _context.next = 8;
              break;
            }

            console.log('getPricesFromCoinMarketCap error', err);
            throw err;

          case 8:

            currencies = currencies.filter(function (currency) {
              return TOKENS[currency.symbol] && !TOKEN_ID_BLACKLIST[currency.id];
            });
            currencies.forEach(function (currency) {
              prices[currency.symbol] = {
                symbol: currency.symbol,
                price: Number(currency['price_usd']) || 0,
                change: Number(currency['percent_change_24h']) || 0,
                change7d: Number(currency['percent_change_7d']) || 0,
                period: '24h',
                marketCap: Number(currency['market_cap_usd']) || 0,
                volume24Hr: Number(currency['24h_volume_usd']) || 0,
                supply: Number(currency['available_supply']) || 0,
                timestamp: Number(currency['last_updated'] || 0)
              };
            });
            return _context.abrupt('return', prices);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getPricesFromCoinMarketCap(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getPricesFromCryptoCompare = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(tsym) {
    var err, batchSize, prices, symbols, numBatches, batches, i, batch, results, priceData;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            err = void 0;
            batchSize = 50;
            prices = {};
            symbols = Object.keys(TOKENS);
            numBatches = Math.floor(symbols.length / batchSize);
            batches = [];


            for (i = 0; i < symbols.length; i += batchSize) {
              batch = symbols.slice(i, i + batchSize);

              if (batch.length) {
                batches.push(batch);
              } else {
                console.log('no symbols in batch', i);
              }
            }

            _context2.next = 9;
            return Promise.map(batches, function (batch) {
              return cc.priceFull(batch, tsym);
            }, { concurrency: 3 }).catch(function (e) {
              return err = e;
            });

          case 9:
            results = _context2.sent;

            if (!err) {
              _context2.next = 12;
              break;
            }

            throw err;

          case 12:
            priceData = results.reduce(function (acc, curr) {
              return _.merge(acc, curr);
            }, {});

            symbols.forEach(function (symbol) {
              if (!priceData[symbol] || !priceData[symbol][tsym]) {
                // console.log('no price data for', symbol, 'to', tsym, priceData[symbol]);
                return;
              }
              var priceInfo = priceData[symbol][tsym];
              prices[symbol] = {
                symbol: symbol,
                price: Number(priceInfo['PRICE']) || 0,
                change: Number(priceInfo['CHANGEPCT24HOUR']) || 0,
                period: '24h',
                marketCap: Number(priceInfo['MKTCAP']) || 0,
                volume24Hr: Number(priceInfo['TOTALVOLUME24H']) || 0,
                supply: Number(priceInfo['SUPPLY']) || 0,
                timestamp: Number(priceInfo['LASTUPDATE'])
              };
            });
            return _context2.abrupt('return', prices);

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getPricesFromCryptoCompare(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var getPricesForSymbol = exports.getPricesForSymbol = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(tsym) {
    var err, rawPrices, cmcPrices, ccPrices, cmcSymbols, ccSymbols, symbols, prices;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('getting prices for ' + tsym);

            err = void 0;
            _context3.next = 4;
            return Promise.all([getPricesFromCoinMarketCap(tsym), getPricesFromCryptoCompare(tsym)]).catch(function (e) {
              return err = e;
            });

          case 4:
            rawPrices = _context3.sent;

            if (!err) {
              _context3.next = 8;
              break;
            }

            console.log({ err: err });
            throw err;

          case 8:
            console.log('Got prices for ' + tsym);

            cmcPrices = rawPrices[0];
            ccPrices = rawPrices[1];
            cmcSymbols = Object.keys(cmcPrices);
            ccSymbols = Object.keys(ccPrices);
            symbols = [].concat(_toConsumableArray(cmcSymbols)).concat(ccSymbols.filter(function (symbol) {
              return !cmcPrices[symbol];
            }));
            prices = symbols.map(function (fsym) {
              var priceData = ccPrices[fsym] || cmcPrices[fsym] || {};
              return {
                fsym: fsym,
                tsym: tsym,
                timestamp: priceData.timestamp,
                price: priceData.price,
                volume_24_hr: priceData.volume24Hr,
                change_pct_24_hr: priceData.change,
                market_cap: priceData.marketCap
              };
            });
            return _context3.abrupt('return', prices);

          case 16:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function getPricesForSymbol(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getPrices = exports.getPrices = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var start, prices;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log('getting prices for', TSYMS.join(', '));
            start = new Date();
            _context4.next = 4;
            return Promise.map(TSYMS, getPricesForSymbol, { concurrency: 2 });

          case 4:
            prices = _context4.sent;

            console.log('got all prices in ' + (Date.now() - start) / 1000 + 's');
            return _context4.abrupt('return', prices.reduce(function (acc, curr) {
              return acc.concat(curr);
            }, []));

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getPrices() {
    return _ref4.apply(this, arguments);
  };
}();