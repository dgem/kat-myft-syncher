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
		log.silly({operation:'syncUser', status:`licencesFound`, count: licences.length, userId:uuid});
		if (licences.length === 0) {
			return {user:{uuid, status:'synchronisationIgnored', reason:'LicenceNotFoundInMembership'}};
		}
		let syncs = licences.map(licence => {
			log.silly({operation:'syncUser', userid:uuid, licenceId:licence.id});
			return myFT.getLicence(licence.id)
			.then(myFTLicence => {
				return syncMyFTUser(uuid, myFTLicence.uuid);
			}).catch((error)=>{
				if (error instanceof proxies.clientErrors.NotFoundError) {
					return {user:{uuid, status:'synchronisationIgnored', reason:'LicenceNotFoundInMyFT', licence:licence.id}};
				} else {
					log.error({operation:'syncUser', error:error.toString()});
					throw new errors.Warning(error.toString());
				}
			});
		});
		log.silly({operation:'return', syncs:syncs.length, s:JSON.stringify(syncs)});
		return Promise.all(syncs);
	});
}

function syncMyFTUser(userId, licenceId){
	log.silly({operation:'syncMyFTUser', userId, licenceId});
	return myFT.getUsersForLicence(licenceId)
	.then(usersResp=>{
		let userIds = usersResp.items.map(user=>user.uuid);
		log.silly({operation:'usersResp', subOp:'usersOnLicence', userIds});
		if (userIds && userIds.indexOf(userId)>0){
			log.silly({operation:'syncMyFTUser', reason:'alreadyMemberOfLicence', userId, licenceId});
			return syncUserOnLicence(userId, licenceId);
		} else {
			log.silly({operation:'syncMyFTUser', resaon:'notMemberOfLicence', userId, licenceId});
			return myFT.addUsersToLicence(userId, licenceId, myFT.membershipProperties)
			.then(()=>{
				syncUserOnLicence(userId, licenceId);
			});
		}
	});
}

function syncUserOnLicence(userId, licenceId){
	log.silly({operation:'syncUserOnLicence', userId, groupId:licenceId});
	return myFT.getUsersForGroup(licenceId).
	then(usersResp=>{
		let userIds = usersResp.items.map(user=>user.uuid);
		if (userIds && userIds.indexOf(userId)>0){
			log.silly({operation:'syncUserOnLicence', reason:'alreadyMemberOfAllUsersGroup', userId, licenceId});
			return syncUserInGroups(userId, [licenceId]);
		} else {
			log.silly({operation:'syncUserOnLicence', reason:'notMemberOfAllUsersGroup', userId, licenceId});
			return myFT.addUsersToGroup(userId, licenceId)
			.then(()=>{
				return syncUserInGroups(userId, [licenceId]);
			});
		}
	});
}

function syncUserInGroups(userId, groupIds){
	log.silly({operation:'syncUserInGroups', userId, groupIds});
	let groupSyncs = groupIds.map(groupId=>{
		return myFT.getConceptsFollowedByGroup(groupId)
		.then(conceptsResp=>{
			let groupConceptIds = conceptsResp.items.map(concept=>concept.uuid);
			log.silly({operation:'syncUserInGroups', subOp:'groupConceptsFollowed', userId, groupId, groupConceptsCount:groupConceptIds.length});
			return myFT.getConceptsFollowedByUser(userId)
			.then(conceptsResp=>{
				let userConceptIds = conceptsResp.items.map(concept=>concept.uuid);
				log.silly({operation:'syncUserInGroups', subOp:'userConceptsFollowed', userId, groupId, userConceptsCount:userConceptIds.length});
				let newConceptsToFollow = groupConceptIds.filter((item)=>{
					return userConceptIds.indexOf(item) < 0;
				});
				if (newConceptsToFollow.length == 0) {
					log.silly({operation:'syncUserInGroups', subOp:'noNewConceptsToFollow', userId, groupId});
					return {user:{uuid:userId, group:groupId, status:'synchronisationIgnored', reason:'noNewConceptsToFollow'}};
				} else {
					log.silly({operation:'syncUserInGroups', subOp:'newConceptsToFollow', userId, group:groupId, newConceptsToFollow});
					let followProps = myFT.followedProperties;
					followProps.asMemberOf=groupId;
					if (newConceptsToFollow.length == 1) {
						return myFT.addConceptsFollowedByUser(userId, newConceptsToFollow[0], followProps)
						.then(()=>{
							return {user:{uuid:userId, status:'synchronisationCompleted', group:groupId, newConceptsToFollow}};
						});
					} else {
						return myFT.addConceptsFollowedByUser(userId, newConceptsToFollow, followProps)
						.then(()=>{
							return {user:{uuid:userId, status:'synchronisationCompleted', group:groupId, newConceptsToFollow}};
						});
					}
				}
			});
		});
	});
	return Promise.all(groupSyncs).then(syncs=>{
		if (Array.isArray(syncs) && syncs.length == 1) {
			syncs = syncs[0];
		}
		log.debug({operation:'syncUserInGroups', subOp:'return', syncs:JSON.stringify(syncs)});
		return syncs;
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
