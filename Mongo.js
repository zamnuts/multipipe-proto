var Mongo,
	MongoClient = require('mongodb').MongoClient;

module.exports = Mongo = function(dbStr,cb) {
	this.db = null;
	this.err = null;
	this._cb = cb;
	MongoClient.connect(
		dbStr,
		this._onConn.bind(this)
	);
};

Mongo.prototype._onConn = function(err,db) {
	this.db = db;
	this.err = err;
	if ( typeof this._cb === 'function' ) {
		this._cb(err,db);
	}
};
