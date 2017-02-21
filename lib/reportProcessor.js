'use strict';

const csv = require('csv');
const Transform = require('stream').Transform;
const log = require('@financial-times/n-lambda').logger;
const errors = require('./errors');

/**
 * Processes a report
 * @param {inputStream} the source of the report
 * @param {outputStream} where a report on the processing is written to
 * @param {reportType} the type of report to process:
 * 										'license-member-users', 'group-license-relationship'
 * @return {Promise} result of processing the report
 */
function process(inputStream, outputStream, reportType) {
    return new Promise((resolve, reject) => {
			if (inputStream === undefined || outputStream === undefined || reportType === undefined) {
				let msg = `at least one require variable is undefined inputStream: ${inputStream} outputStream: ${outputStream} reportType: ${reportType}`;
				log.error({operation:'reportProcessor', status:msg});
				return Promise.reject(new Warning(msg));
			}
      let transformer;
      switch (reportType) {
          case 'license-member-users':
              transformer = new LicenseMemberUsers();
              break;
          default:
              let msg = `unhandled reportType: ${reportType}`;
              log.error({operation: 'reportProcessor', status: msg});
              reject(new errors.Warning(msg));
      }
      if (transformer === undefined) {
          reject(new errors.Warning('transformer is undefined'));
      }
      return processReport(inputStream, outputStream, transformer);
    });
}

function processReport(inputStream, outputStream, transformer) {
    return new Promise((resolve, reject) => {
        var data;
        var parser = csv.parse();
        parser.on('data', function(row) {
            parsed++;
            data = buildData(row, type);
        });
        inputStream.pipe(parser).pipe(transformer).pipe(outputStream).on('error', (error => {
            reject(error);
        })).on('end', () => {
            resolve("Processing completed");
        });
    });
}

class LicenseMemberUsers extends Transform {
    constructor(options) {
        super(options);
    }

    _transform(chunk, encoding, calllback) {
        log.silly({op: '_transform', length: chunk.length, encoding, data: chunk.toString()});
        calllback(null, chunk, encoding);
    }

    _flush(callback) {
        callback();
    }
}

module.exports = process;
