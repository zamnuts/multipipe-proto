var DoIt = require('./DoIt.js');
new DoIt({
	filePath: './samples/STR.csv',
	targetMongo: 'mongodb://localhost:27017/multipipe-proto',
	targetCollection: 'str'
}).start(function(inst,isStarted) {
	if ( isStarted ) {
		setTimeout(inst.stop.bind(inst),1000*5); // stop after 5 seconds
	}
});
