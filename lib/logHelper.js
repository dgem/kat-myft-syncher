'use strict';


function dump(object) {
	if (process.env.NODE_ENV && !/^prod/i.test(process.env.NODE_ENV)) {
		log.debug({operation:'dumpObject', object:stringify(object)});
	}
}

function stringify(object) {
	let res = JSON.stringify(object);
	res = res.replace(/(\"x-api-key\"\:\")([^\"]*)/igm, "$1****");
	res = res.replace(/(\"apikey\"\:\")([^\"]*)/igm, "$1****");
	res = res.replace(/\"([a-z0-9]{1,2})[^\@\"]*@([^\"]{1,3})[^\"]*/igm, "$1...@$2...");
	res = res.replace(/(\"homeAddress\"\:)(\{[^]*\})/igm, "$1\"****\"");
	res = res.replace(/(\"firstName\"\:)(\"[^\"}]*\")/igm, "$1\"****\"");
	res = res.replace(/(\"lastName\"\:)(\"[^\"]*\")/igm, "$1\"****\"");
	return res;
}

module.exports = {
	dump,
	stringify
};
