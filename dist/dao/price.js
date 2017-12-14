'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.histMulti = exports.hist = exports.nowMulti = exports.now = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _influx = require('influx');

var _db = require('../lib/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var formatChart = function formatChart() {
	var price = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return {
		x: price.close,
		y: +price.time
	};
};

var now = exports.now = function () {
	var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(fsym, tsym) {
		var query, err, rows;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						query = '\n\t\tselect * from ticker_prices\n\t\twhere fsym = ' + _influx.escape.stringLit(fsym) + ' and tsym = ' + _influx.escape.stringLit(tsym) + '\n\t\torder by time desc\n\t\tlimit 1\n\t';
						err = void 0;
						_context.next = 4;
						return _db2.default.query(query, { precision: _influx.Precision.Milliseconds }).catch(function (e) {
							return err = e;
						});

					case 4:
						rows = _context.sent;

						if (!err) {
							_context.next = 7;
							break;
						}

						throw err;

					case 7:
						return _context.abrupt('return', _defineProperty({}, fsym, _defineProperty({}, tsym, rows[0])));

					case 8:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function now(_x2, _x3) {
		return _ref.apply(this, arguments);
	};
}();

var nowMulti = exports.nowMulti = function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(fsyms, tsyms) {
		var query, err, rows, map;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						query = '\n\t\tselect * from ticker_prices\n\t\twhere fsym =~ /' + fsyms.join('|') + '/\n\t\tand tsym =~ /' + tsyms.join('|') + '/\n\t\tgroup by fsym,tsym\n\t\torder by time desc\n\t\tlimit 1\n\t';
						err = void 0;
						_context2.next = 4;
						return _db2.default.query(query, { precision: _influx.Precision.Milliseconds }).catch(function (e) {
							return err = e;
						});

					case 4:
						rows = _context2.sent;

						if (!err) {
							_context2.next = 7;
							break;
						}

						throw err;

					case 7:
						map = {};

						rows.forEach(function (row) {
							if (!map[row.fsym]) {
								map[row.fsym] = {};
							}
							map[row.fsym][row.tsym] = row;
						});
						return _context2.abrupt('return', map);

					case 10:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function nowMulti(_x4, _x5) {
		return _ref3.apply(this, arguments);
	};
}();

var hist = exports.hist = function () {
	var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(fsym, tsym) {
		var period = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '1d';
		var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
		var end = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
		var format = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'price';
		var query, err, rows, map;
		return _regenerator2.default.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						start = new Date(Number(start));
						end = end ? new Date(Number(end)) : new Date();
						query = '\n\t\tselect * from historical_prices\n\t\twhere fsym = ' + _influx.escape.stringLit(fsym) + '\n\t\tand tsym = ' + _influx.escape.stringLit(tsym) + '\n\t\tand high > 0\n\t\tand time >= ' + _influx.escape.stringLit(start.toISOString()) + '\n\t\tand time <= ' + _influx.escape.stringLit(end.toISOString()) + '\n\t\torder by time desc\n\t';
						err = void 0;
						_context3.next = 6;
						return _db2.default.query(query, { precision: _influx.Precision.Milliseconds }).catch(function (e) {
							return err = e;
						});

					case 6:
						rows = _context3.sent;

						if (!err) {
							_context3.next = 9;
							break;
						}

						throw err;

					case 9:
						map = _defineProperty({}, fsym, {});

						rows.forEach(function (row) {
							if (!map[fsym][row.tsym]) {
								map[row.fsym][row.tsym] = [];
							}
							var price = row;
							if (format === 'chart') {
								price = formatChart(row);
							}
							map[row.fsym][row.tsym].push(price);
						});
						return _context3.abrupt('return', map);

					case 12:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function hist(_x10, _x11) {
		return _ref4.apply(this, arguments);
	};
}();

var histMulti = exports.histMulti = function () {
	var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(fsyms, tsyms) {
		var period = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '1d';
		var start = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
		var end = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
		var format = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'price';
		var query, err, rows, map;
		return _regenerator2.default.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						start = new Date(Number(start));
						end = end ? new Date(Number(end)) : new Date();
						query = '\n\t\tselect * from historical_prices\n\t\twhere fsym =~ /' + fsyms.join('|') + '/\n\t\tand tsym =~ /' + tsyms.join('|') + '/\n\t\tand high > 0\n\t\tand time >= ' + _influx.escape.stringLit(start.toISOString()) + '\n\t\tand time <= ' + _influx.escape.stringLit(end.toISOString()) + '\n\t\torder by time desc\n\t';
						err = void 0;
						_context4.next = 6;
						return _db2.default.query(query, { precision: _influx.Precision.Milliseconds }).catch(function (e) {
							return err = e;
						});

					case 6:
						rows = _context4.sent;

						if (!err) {
							_context4.next = 9;
							break;
						}

						throw err;

					case 9:
						map = {};

						rows.forEach(function (row) {
							if (!map[row.fsym]) {
								map[row.fsym] = {};
							}
							if (!map[row.fsym][row.tsym]) {
								map[row.fsym][row.tsym] = [];
							}
							var price = row;
							if (format === 'chart') {
								price = formatChart(row);
							}
							map[row.fsym][row.tsym].push(price);
						});
						return _context4.abrupt('return', map);

					case 12:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, undefined);
	}));

	return function histMulti(_x16, _x17) {
		return _ref5.apply(this, arguments);
	};
}();