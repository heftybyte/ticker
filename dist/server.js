'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _price = require('./dao/price');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require("dotenv").config();
var express = require('express');
var app = express();


app.get('/price/now', function () {
	var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res) {
		var _req$query, fsym, tsym, price;

		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_req$query = req.query, fsym = _req$query.fsym, tsym = _req$query.tsym;
						_context.next = 3;
						return (0, _price.now)(fsym, tsym);

					case 3:
						price = _context.sent;

						res.send(price);

					case 5:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, undefined);
	}));

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
}());

app.get('/prices/now', function () {
	var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
		var _req$query2, fsyms, tsyms, price;

		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_req$query2 = req.query, fsyms = _req$query2.fsyms, tsyms = _req$query2.tsyms;

						fsyms = fsyms.split(',');
						tsyms = tsyms.split(',');
						_context2.next = 5;
						return (0, _price.nowMulti)(fsyms, tsyms);

					case 5:
						price = _context2.sent;

						res.send(price);

					case 7:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, undefined);
	}));

	return function (_x3, _x4) {
		return _ref2.apply(this, arguments);
	};
}());

app.get('/price/historical', function () {
	var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res) {
		var _req$query3, fsym, tsym, start, end, format, period, price;

		return _regenerator2.default.wrap(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						_req$query3 = req.query, fsym = _req$query3.fsym, tsym = _req$query3.tsym, start = _req$query3.start, end = _req$query3.end, format = _req$query3.format, period = _req$query3.period;
						_context3.next = 3;
						return (0, _price.hist)(fsym, tsym, period, start, end, format);

					case 3:
						price = _context3.sent;

						res.send(price);

					case 5:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, undefined);
	}));

	return function (_x5, _x6) {
		return _ref3.apply(this, arguments);
	};
}());

app.get('/prices/historical', function () {
	var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res) {
		var _req$query4, fsyms, tsyms, start, end, format, period, price;

		return _regenerator2.default.wrap(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						_req$query4 = req.query, fsyms = _req$query4.fsyms, tsyms = _req$query4.tsyms, start = _req$query4.start, end = _req$query4.end, format = _req$query4.format, period = _req$query4.period;

						fsyms = fsyms.split(',');
						tsyms = tsyms.split(',');
						_context4.next = 5;
						return (0, _price.histMulti)(fsyms, tsyms, period, start, end, format);

					case 5:
						price = _context4.sent;

						res.send(price);

					case 7:
					case 'end':
						return _context4.stop();
				}
			}
		}, _callee4, undefined);
	}));

	return function (_x7, _x8) {
		return _ref4.apply(this, arguments);
	};
}());

app.listen(process.env.PORT, function () {
	console.log('listening on ' + process.env.PORT);
});