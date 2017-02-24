'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');

function ping(event) {
	if (event.isFatal) {
		throw new errors.Fatal("Fatal ping test");
	} else if (event.isWarning) {
		throw new errors.Warning("Warning ping test");
	}
	return {statusCode:200, body:"OK"};
}

function gtg(event) {
	return {statusCode:200, body:"OK"};
}

module.exports = {
	ping,
	gtg,
	// healthCheck
};
