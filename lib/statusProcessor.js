'use strict';

const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');

function ping(event) {
	return new Promise ((resolve, reject)=>{
		if (event.isFatal) {
			reject (new errors.Fatal("Fatal ping test"));
		} else if (event.isWarning) {
			reject (new errors.Warning("Warning ping test"));
		}
		resolve("OK");
	});
}

function gtg(event) {
	let result = 'OK';
	return new Promise ((resolve, reject)=>{
		resolve(result);
	}).then(result=>{
		log.silly({operation: 'gtg', event, result:JSON.stringify(result)});
		return result;
	});
}

module.exports = {
	ping,
	gtg,
	// healthCheck
};
