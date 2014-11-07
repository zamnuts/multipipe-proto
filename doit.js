var DoIt,
	Mongo = require('./Mongo.js'),
	ParallelWritable = require('./ParallelWritable.js'),
	ParallelTransform = require('./ParallelTransform.js'),
	Pipeline = require('./Pipeline.js'),
	csv = require('csv'),
	fs = require('fs'),
	l = require('lodash');

module.exports = DoIt = function(opts) {
	this.opts = opts;
	this.pipeline = null;
	this.writeCount = 0;
};

DoIt.prototype.stop = function() {
	this.pipeline.stop();
}

DoIt.prototype.start = function(callback) {
	var db,coll,
		now = new Date(),
		pws = new ParallelWritable(function(obj,enc,cb) {
			coll.update({
				fieldA: obj.fieldA
			},{
				$set: l.merge({},obj,{
					timestamp: now
				}),
				$inc: {
					hits: 1
				}
			},{
				upsert: true
			},function(err,result) {
				if ( result ) {
					this.writeCount++;
				}
				cb(err);
			}.bind(this));
		}.bind(this)),
		fss = fs.createReadStream(this.opts.filePath),
		cps = csv.parse(),
		cts = csv.transform(function(row,cb) {
			cb(null,row && row[0] ? {
				fieldA: row[0]
			} : null);
		}),
		dts = new ParallelTransform(function(obj,enc,cb) {
			cb(null,typeof obj === 'object' ? l.merge({
				random: getRandomInt(1,99)
			},obj) : null);
		}),
		closeDb = function() {
			if ( db ) {
				db.close(function(){
					console.log(
						'[%s] db closed, wrote %d records',
						new Date().toISOString(),
						this.writeCount
					);
				}.bind(this));
			}
		}.bind(this);

	this.pipeline = new Pipeline([
		fss,
		cps,
		cts,
		dts,
		pws
	],this.opts.pipeline).on('error',function(err){
		closeDb();
	}).once('done',function() {
		closeDb();
	});

	new Mongo(this.opts.targetMongo,function(err,_db) {
		if ( err ) {
			throw err;
		}
		db = _db;
		coll = _db.collection(this.opts.targetCollection);
		coll.drop(function(err) {
			this.pipeline.start()
			callback(this,this.pipeline.started);
		}.bind(this));
	}.bind(this));
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
