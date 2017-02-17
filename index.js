'use strict';

const λ = require('@financial-times/n-lambda');
const log = λ.logger;
const process = require('./lib/eventProcessor');
const errors = require('./lib/errors');

exports.handler = λ(function(event) {
  return process(event)
	.then(()=>{
		log.debug({operation: 'handler', status: 'eventProcessed'});
	})
  .catch(function(error) {
    if (error instanceof errors.Fatal) {
      λ.raven.captureError(error);
			return Promise.reject(error);
    } else {
			log.error({operation: 'handler', error});
			return Promise.resolve(error);
		}
  });
});
