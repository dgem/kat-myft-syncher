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
	log.silly({operation:'syncUser', uuid, data:JSON.stringify(data)});
	return getLicences(uuid, data)
	.then(licences=> {
		log.silly({operation:'syncUser', count: licences.length, status:`licencesFound`, userId:uuid});
		if (licences.length === 0) {
			return {user:{uuid, status:'synchronisationIgnored', reason:'LicenceNotFoundInMembership'}};
		}
		let syncs = licences.map(licence => {
			log.silly({operation:'syncUser', licence:JSON.stringify(licence), id:licence.id});
			return myFT.getLicence(licence.id)
			.then(myFTLicence => {
				log.silly({operation:'syncUser', subOp: 'myFTLicence', myFTLicence:JSON.stringify(myFTLicence)});
				return {user:{uuid, licence:licence.id, status:'synchronised'}};
			}).catch((error)=>{
				if (error instanceof proxies.clientErrors.NotFoundError) {
					return {user:{uuid, status:'synchronisationIgnored', reason:'LicenceNotFoundInMyFT', licence:licence.id}};
				} else {
					log.error({operation:'syncUser', error});
					throw new errors.Warning(error.message);
				}
			});
		});
		return Promise.all(syncs);
	});
		// if (licences.length === 0) {
		// 	return Promise.resolve({user:{uuid, status:'no licence found for user'}});
		// } else {
		// 	console.log("*%%%%%%%%%*");
		// 	let promises = licences.map(licence=>{
		// 		myFT.getLicence(licence.id)
		// 		.then(myFTLicence => {
		// 			log.silly({operation:'syncUser', subOp:'myFT.getLicence', uuid, licence: licence.id, myFTLicence, status:'found'});
		// 			return Promise.resolve({user:{uuid, status:'synchronised'}});
		// 		}).catch(error=>{
		// 			if (error instanceof proxies.clientErrors.NotFoundError) {
		// 				return Promise.resolve({user:{uuid, status:'synchronisationIgnored', reason:'License Not Found in myFT', licence:licence.id}});
		// 			} else {
		// 				log.error({operation:'syncUser', uuid, licence: licence.id, error, status:'myFT error'});
		// 				throw error;
		// 			};
		// 		});
		// 	});
		// 	return Promise.all(promises);
		// 	}
		// })
		// .then((result)=>{
		// 	log.debug({operation:'syncUser', uuid, data, result:JSON.stringify(result) });
		// 	return result;
		// }).catch((err)=>{console.log(err);});
}

/**
 * Synchronises a given license
 * @param {uuid} the uuid of the license
 * @param {data} anything already known about the license
 * @return {Promise} result of processing the message
 */
function licence(uuid, data){

}

function getLicences(uuid, data) {
	return new Promise((resolve, reject)=>{
		if (data.licenceId) {
			let result = [{id:data.licenceId}];
			log.silly({operation:'getLicences', licences:JSON.stringify(result)});
			resolve(result);
		} else {
			als.getLicences({userid:uuid})
			.then((result) => {
				log.silly({operation:'getLicences', uuid, subOp:'alsLookup', licences: JSON.stringify(result)});
				resolve(result);
			});
		}
	});
}

module.exports = {
	user,
	licence
};
