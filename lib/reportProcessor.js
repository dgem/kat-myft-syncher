'use strict';


const csv = require('csv');

function process(stream) {
	var data;
	var parser = csv.parse();
	parser
	.on('data', function(row){
		parsed++;
		data = buildData(row, type);
	});
	stream.pipe(parser);
}


module.exports=process;
