'use strict';
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const mongodb = require('mongodb');
/**
 *
 * @constructor
 */
function More(options) {
	if (typeof options !== 'object' || options === null) {
		options = {prefix: ''};
	}
	/**
	 *
	 * @type {object}
	 */
	this.next = null;
	/**
	 *
	 */
	if (!(options.db instanceof mongodb.Db)) {
		throw new TypeError('"options.db" must be instance of "mongodb.Db"');
	}
	this.db = options.db;
	this.clearStats();
}
/**
 *
 * @param key
 * @param field
 * @param callback
 */
More.prototype.has = function (key, field, callback) {
	this.db.collection(key).findOne({_id: new mongodb.ObjectId(field)}, (err, value) => {
		callback(null, !(err || value === null));
	});
};
/**
 *
 * @param key
 * @param field
 * @param callback
 */
More.prototype.get = function (key, field, callback) {
	this.db.collection(key).findOne({_id: new mongodb.ObjectId(field)}, (err, value) => {
		if (!err && value !== null) {
			this.stats.hits++;
			return callback(null, value);
		}
		this.stats.misses++;
		if (this.next !== null) {
			return this.next.get(key, field, (next_err, value) => {
				if (next_err) {
					return callback(next_err);
				}
				if (value === null) {
					return callback(err, null);
				}
				callback(null, value);
			});
		}
		callback(err, null);
	});
};
/**
 *
 * @param key
 * @param field
 * @param value
 * @param callback
 */
More.prototype.set = function (key, field, value, callback) {
	if (this.next !== null) {
		return this.next.set(key, field, value, callback);
	}
	process.nextTick(() => {
		callback(null);
	});
};
/**
 *
 * @param key
 * @param field
 * @param callback
 */
More.prototype.delete = function (key, field, callback) {
	if (this.next !== null) {
		return this.next.delete(key, field, callback);
	}
	process.nextTick(() => {
		callback(null);
	});
};
/**
 * @param [propagate]
 * @param callback
 * @todo implement
 */
More.prototype.clear = function (propagate, callback) {
	if (typeof propagate === 'function') {
		callback = propagate;
		propagate = undefined;
	}
	if (propagate && this.next) {
		return void this.next.clear(propagate, callback);
	}
	process.nextTick(() => {
		callback(null);
	});
};
/**
 * @param [clear]
 * @returns {Object}
 */
More.prototype.getStats = function (clear) {
	const stats = this.stats;
	stats.ratio = stats.hits && stats.misses ? stats.hits / stats.misses : 0;
	if (clear) {
		this.clearStats();
	}
	return stats;
};
/**
 *
 */
More.prototype.clearStats = function () {
	this.stats = {
		hits: 0,
		misses: 0
	};
};
module.exports = More;
