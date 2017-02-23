'use strict';


function dump(object) {
	if (process.env.NODE_ENV && !/^prod/i.test(process.env.NODE_ENV)) {
		log.debug({operation:'dumpObject', object:stringify(object)});
	}
}

function stringify(object) {
	let res = JSON.stringify(object);
	// TODO filter
	return res;
}

module.exports = {
	dump,
	stringify
};
