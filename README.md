# kat-myft-syncher
A lambda based sphincter to synchronise myFT data based on results from the next-myft-jobs

## Deployment
The easiest way to deploy this λ is to use node-lambda deploy. Additional resources are required and defined in the infrastructure/lambda.yaml file

NB. triggering the lambda from S3 buckets that are not 'owned' by this causes the CloudFormation to have issues. Specifically the `NotificationConfiguration` section of /infrastructure/lambda.yaml

## Configuration
Once deployed, ensure that membership's http-kafka-bridge is configured to send LicenseSeatAllocated & LicenseSeatDeallocated messages.
kat-myft-syncher uses kat-client-proxies, so it needs to the following env vars:
```
MYFT_API_KEY
MYFT_API_URL
ACS_API_URL
ACS_API_KEY
ALS_API_URL
ALS_API_KEY
USER_PROFILE_API_URL
USER_PROFILE_API_KEY
```

In addition to the above a few runtime properties are used, as per lib/config.js:
```
DIRECTLY_MAX_PROMISES
```

## Current limitations
Currently only reliably handles the LicenseSeatAllocated message.
