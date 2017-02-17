'use strict';


const csv = require('csv');

function process({inputStream, outputStream, reportType}) {
	return new Promise((resolve, reject)=>{
		var data;
		var parser = csv.parse();
		parser
		.on('data', function(row){
			parsed++;
			data = buildData(row, type);
		});
		inputStream
		.pipe(parser)
		.pipe(outputStream)
		.on('error', (error=>{
			reject(error);
		}))
		.on('end', () => {
			resolve("Processing completed");
		});
	});
}


module.exports=process;
