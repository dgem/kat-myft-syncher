'use-strict';
// class ServerError extends Error {
// 	constructor(message){
// 		super(message);
// 		this.message = message;
// 		this.name = this.constructor.name;
// 	}
// }


var λ = require('@financial-times/n-lambda');

exports.handler = λ(function(event) {
  return process(event)
    .catch(function(err) {
      if (err instanceof Error) {
        λ.raven.captureError(err);
      }
      return Promise.reject(err);
    });
});

function process(event) {
	return new Promise((resolve, reject) => {
		event.Records.forEach((record, index)=>{
			λ.logger.debug({operation:'processEvent', index, eventName: record.eventName, userIdentity: record.userIdentity.principalId, eventSource: record.eventSource, s3Object: record.s3.object.key, bucketName: record.s3.bucket.name, bucketARN: record.s3.bucket.arn, bucketOwner: record.s3.bucket.ownerIdentity.principalId});
		});
	})
	.catch(error => {
		λ.logger.error({operation:'processEvent', error});
	});
}
