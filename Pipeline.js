var Pipeline,
	events = require('events'),
	util = require('util'),
	l = require('lodash');

module.exports = Pipeline = function(pipeline,opts) {
	this.setup(pipeline);
	this.hasError = false;
	this.started = false;
	this.opts = l.merge({
		doEmpty: true,
		bufferStatusInterval: 1000
	},opts || {});
	this._interval = setInterval(function() {
		if ( !this.pipeline || !this.pipeline.length ) {
			return;
		}
		var lastpl = this.pipeline[this.pipeline.length-1];
		console.log(
			'[%s] bufferlen=%d, length=%d, end=%s, fin=%s',
			new Date().toISOString(),
			lastpl._writableState.buffer.length,
			lastpl._writableState.length,
			lastpl._writableState.ending,
			lastpl._writableState.finished
		);
	}.bind(this),this.opts.bufferStatusInterval);
};

util.inherits(Pipeline,events.EventEmitter);

Pipeline.prototype.start = function start() {
	if ( this.hasError ) {
		this.onError('start',new Error('cannot start.'));
		return;
	}
	console.log(
		'[%s] pipeline.start',
		new Date().toISOString()
	);
	this.started = true;
	var tmp = null,
		pl = this.pipeline;
	for ( var i = 0; i < pl.length; i++ ) {
		if ( !tmp ) {
			tmp = pl[i];
			continue;
		}
		tmp = tmp.pipe(pl[i]);
	}
	tmp.once('finish',this.onDone.bind(this,'finish'));
	this.emit('start');
	return this;
};

Pipeline.prototype.stop = function stop() {
	console.log(
		'[%s] pipeline.stop',
		new Date().toISOString()
	);
	var tmp = null;
		pl = this.pipeline;
	for ( i = pl.length - 1; i >= 0; i-- ) {
		if ( !tmp ) {
			tmp = pl[i];
			continue;
		}
		tmp = pl[i].unpipe(tmp);
	}
	for ( i = 0; i < pl.length; i++ ) {
		if ( this.opts.doEmpty && typeof pl[i]._writableState === 'object' ) {
			console.log(
				'[%s] (%d) emptied buffer  with length %d / %d',
				new Date().toISOString(),
				i,
				pl[i]._writableState.buffer.length,
				pl[i]._writableState.length
			);
			pl[i]._writableState.length -= pl[i]._writableState.buffer.length;
			pl[i]._writableState.buffer = [];
		}
		if ( typeof pl[i].end === 'function' ) {
			pl[i].end();
		}
	}
	this.emit('stop');
};

Pipeline.prototype.onError = function onError(eventName,err) {
	clearInterval(this._interval);
	console.warn(
		'[%s] pipeline.error %s',
		new Date().toISOString(),
		eventName,
		err.toString()
	);
	this.hasError = true;
	this.emit('error',err);
};

Pipeline.prototype.onDone = function onDone(eventName) {
	clearInterval(this._interval);
	console.log(
		'[%s] pipeline.done "%s"',
		new Date().toISOString(),
		eventName
	);
	this.emit('done');
};

Pipeline.prototype.setup = function setup(pipeline) {
	this.pipeline = pipeline || [];
	var pl = this.pipeline;
	for ( var i = 0; i < pl.length; i++ ) {
		pl[i].on('error',this.onError.bind(this,'error'));
	}
	return this;
};
