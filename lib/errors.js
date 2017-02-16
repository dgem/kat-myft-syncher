'use strict';

class Warning extends Error {
	constructor(message){
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}


class Fatal extends Error {
	constructor(message){
		super(message);
		this.message = message;
		this.name = this.constructor.name;
	}
}

module.exports = {
	Fatal,
	Warning,
};
