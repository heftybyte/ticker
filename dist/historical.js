'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.periodTsyms = exports.periodInterval = exports.histFn = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _influx = require('influx');

var _db = require('./lib/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// required by cryptocompare
global.fetch = require('node-fetch');

var cc = require('cryptocompare');
var TSYMS = require('./data/tsyms');
var TOKENS = require('./data/tokens');
var FSYMS = Object.keys(TOKENS);
var Promise = require('bluebird');

var MEASUREMENT = 'historical_prices';

var histFn = exports.histFn = {
	'1d': cc.histoDay,
	'1m': cc.histoMinute,
	'1h': cc.histoHour
};

var periodInterval = exports.periodInterval = {
	'1d': 3600 * 24 * 1000,
	'1m': 60 * 1000 * 10,
	'1h': 3600 * 1000
};

var periodTsyms = exports.periodTsyms = {
	'1d': TSYMS,
	'1m': ['USD'],
	'1h': ['USD']
};

var storeHistoricalPrice = function () {
	var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref) {
		var fsym = _ref.fsym,
		    tsym = _ref.tsym,
		    _ref$period = _ref.period,
		    period = _ref$period === undefined ? '1d' : _ref$period;
		var err, prices, points;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						err = void 0;
						_context.next = 3;
						return histFn[period](fsym, tsym, { limit: 2000 }).catch(function (e) {
							return err = e;
						});

					case 3:
						prices = _context.sent;

						if (!err) {
							_context.next = 7;
							break;
						}

						console.error('storeHistoricalPrice:: ' + fsym + '->' + tsym + ' an error occurred', err);
						return _context.abrupt('return', false);

					case 7:
						points = prices.map(function (price) {
							return {
								measurement: MEASUREMENT,
								tags: { fsym: fsym, tsym: tsym },
								fields: {
									open: price.open,
									close: price.close,
									high: price.high,
									low: price.low
								},
								timestamp: price.time
							};
						});


						console.log('saving ' + points.length + ' historical price points for ' + fsym + '->' + tsym);

						_context.next = 11;
						return _db2.default.writePoints(points, { precision: _influx.Precision.Seconds }).catch(function (e) {
							return err = e;
						});

					case 11:
						if (!err) {
							_context.next = 16;
							break;
						}

						console.error('an error occured', err);
						return _context.abrupt('return', false);

					case 16:
						console.log('saved ' + points.length + ' historical price points for ' + fsym + '->' + tsym);
						return _context.abrupt('return', true);

					case 18:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function storeHistoricalPrice(_x) {
		return _ref2.apply(this, arguments);
	};
}();

var storeHistoricalPrices = function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
		var period = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '1d';
		var pairs, tsyms, i, j, err, results;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						pairs = [];
						tsyms = periodTsyms[period];

						for (i = 0; i < tsyms.length; i++) {
							for (j = 0; j < FSYMS.length; j++) {
								pairs.push({
									fsym: FSYMS[j],
									tsym: tsyms[i],
									period: period
								});
							}
						}
						err = void 0;
						_context2.next = 6;
						return Promise.map(pairs, storeHistoricalPrice, { concurrency: 4 }).catch(function (e) {
							return err = e;
						});

					case 6:
						results = _context2.sent;

						if (err) {
							console.error('an error occured', err);
						} else {
							console.log('finished', results.length);
						}

					case 8:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function storeHistoricalPrices() {
		return _ref3.apply(this, arguments);
	};
}();
var period = process.argv[2] || '1d';
var interval = periodInterval[period];

console.log({ period: period, interval: interval });

setInterval(function () {
	storeHistoricalPrices(period);
}, interval);
storeHistoricalPrices(period);