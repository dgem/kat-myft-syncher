'use strict';

const proxies = require('kat-client-proxies');
const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');
const als = proxies.accessLicenceClient;
const myFT = proxies.myFTClient;


/**
 * Synchronises a given user
 * @param {uuid} the uuid of the user
 * @param {data} anything already known about the user
 * @return {Promise} result of processing the message
 */
function user(uuid, data){
	return new Promise((resolve, reject)=>{
		als.getLicences({userid:uuid}).then(licences=>{
			if (licences.length > 0){
				log.silly({operation:'syncUser', subOp:'als.getLicences', status:`licences found`, uuid, licencesCount: licences.length});
			} else {
				log.warn({operation:'syncUser', subOp:'als.getLicences', status:'no licences found for user', uuid, licencesCount: licences.length});
				resolve({user:{uuid, status:'no licence found for user'}});
			}
			licences.forEach(licence=>{
				myFT.getLicence(licence.id).then(myFTLicence => {
					log.silly({operation:'syncUser', uuid, licence: licence.id, myFTLicence, status:'found'});
				}).catch(error=>{
					log.error({operation:'syncUser', uuid, licence: licence.id, error, status:'myFT error'});
				});
			});
			resolve({user:{uuid, status:'synchronised'}});
		}).catch(error=>{
			log.silly({operation:'syncUser', uuid, licence: licence.id, error, status:'als error'});
		});
	})
	.then((result)=>{
		log.debug({operation:'syncUser', uuid, data, result:JSON.stringify(result) });
		return result;
	});
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
