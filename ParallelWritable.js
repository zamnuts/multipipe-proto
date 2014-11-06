var ParallelWritable,
	Writable = require('writable-stream-parallel').Writable,
	util = require('util');

module.exports = ParallelWritable = function(fn,opt) {
	opt = opt || {};
	opt.objectMode = true;
	opt.maxWrites = 10;
	ParallelWritable.super_.call(this,opt);
	this._write = fn.bind(this);
};

util.inherits(ParallelWritable,Writable);
