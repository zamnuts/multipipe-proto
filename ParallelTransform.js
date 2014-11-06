var ParallelTransform,
	Transform = require('writable-stream-parallel').Transform,
	util = require('util');

module.exports = ParallelTransform = function(fn,opt) {
	opt = opt || {};
	opt.objectMode = true;
	opt.maxWrites = 10;
	ParallelTransform.super_.call(this,opt);
	this._transform = fn.bind(this);
};

util.inherits(ParallelTransform,Transform);
