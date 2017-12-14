'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _influx = require('influx');

var _timers = require('timers');

var _prices = require('./lib/prices');

var _db = require('./lib/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var pollDuration = process.env.POLL_DURATION || 30000;

var storeCurrentPrices = function () {
	var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
		var prices, points, err;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.next = 2;
						return (0, _prices.getPrices)();

					case 2:
						prices = _context.sent;

						// console.log('got prices', prices);

						points = prices.map(function (price) {
							return {
								measurement: 'ticker_prices',
								tags: {
									fsym: price.fsym,
									tsym: price.tsym
								},
								fields: {
									price: price.price,
									volume_24_hr: price.volume_24_hr,
									change_pct_24_hr: price.change_pct_24_hr,
									market_cap: price.market_cap
								},
								timestamp: price.timestamp
							};
						});


						console.log('saving ' + points.length + ' price points');

						err = void 0;
						_context.next = 8;
						return _db2.default.writePoints(points, { precision: _influx.Precision.Seconds }).catch(function (e) {
							return err = e;
						});

					case 8:

						if (err) {
							console.error('an error occured', err);
						} else {
							console.log('saved ' + points.length + ' price points');
						}

					case 9:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function storeCurrentPrices() {
		return _ref.apply(this, arguments);
	};
}();

storeCurrentPrices();
(0, _timers.setInterval)(storeCurrentPrices, pollDuration);