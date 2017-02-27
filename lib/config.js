'use-strict';

require('dotenv').config();

const DIRECTLY_MAX_PROMISES = process.env.DIRECTLY_MAX_PROMISES || 10;


module.exports={
	DIRECTLY_MAX_PROMISES
};
