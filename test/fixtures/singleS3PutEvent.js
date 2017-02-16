'use-strict';

module.exports=function({eventSource, eventName, eventTime, userID, s3ObjectKey, s3BucketArn, s3BucketName, s3BucketOwnerID}){
	return {
		"Records": [
	    {
	      "eventVersion": "2.0",
	      "eventTime": eventTime || new Date().toISOString,
	      "requestParameters": {
	        "sourceIPAddress": "127.0.0.1"
	      },
	      "s3": {
	        "configurationId": "testConfigRule",
	        "object": {
	          "eTag": "0123456789abcdef0123456789abcdef",
	          "sequencer": "0A1B2C3D4E5F678901",
	          "key": s3ObjectKey || "HappyFace.jpg",
	          "size": 1024
	        },
	        "bucket": {
	          "arn": s3BucketArn || "arn:aws:s3:::mybucket",
	          "name": s3BucketName || "sourcebucket",
	          "ownerIdentity": {
	            "principalId": s3BucketOwnerID || "EXAMPLE"
	          }
	        },
	        "s3SchemaVersion": "1.0"
	      },
	      "responseElements": {
	        "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
	        "x-amz-request-id": "EXAMPLE123456789"
	      },
	      "awsRegion": region || "eu-west-1",
	      "eventName": eventName || "ObjectCreated:Put",
	      "userIdentity": {
	        "principalId": userID || "EXAMPLE"
	      },
	      "eventSource": eventSource || "aws:s3"
	    }
	  ]
	};
};
