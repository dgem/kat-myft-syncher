'use strict';

const proxies = require('kat-client-proxies');
const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');


/**
 * Synchronises a given user
 * @param {uuid} the uuid of the user
 * @param {data} anything already known about the user
 * @return {Promise} result of processing the message
 */
function user(uuid, data){
	return new Promise((resolve, reject)=>{
		resolve({user:{uuid, status:'synchronised'}});
	})
	.then((result)=>{
		log.debug({operation:'syncUser', uuid, data, result:JSON.stringify(result) });
		return result;
	})
}

/**
 * Synchronises a given license
 * @param {uuid} the uuid of the license
 * @param {data} anything already known about the license
 * @return {Promise} result of processing the message
 */
function licence(uuid, data){

}

module.exports = {
	user,
	licence
};
