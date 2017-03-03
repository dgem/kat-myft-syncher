'use strict';

const validUserId = process.env.USER_UUID;
const validLicenceId = process.env.LICENCE_UUID;
const validConceptId = process.env.CONCEPT_UUID || 'TnN0ZWluX09OX0ZvcnR1bmVDb21wYW55X0FBUEw=-T04=';

module.exports = {
	validUserId,
	validLicenceId,
	validConceptId
};
