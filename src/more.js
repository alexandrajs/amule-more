"use strict";
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const Layer = require("amule").Layer;
const mongodb = require("mongodb");

class More extends Layer {
	constructor(db, options) {
		super();
		/**
		 *
		 */
		if (!(db instanceof mongodb.Db)) {
			throw new TypeError("'options.db' must be instance of 'mongodb.Db'");
		}
		this.options = Object.assign({
			enforceObjectID: true,
			readOnly: true
		}, options || {});
		this.db = db;
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_has(key, field, callback) {
		this.db.collection(key).findOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, (err, value) => {
			callback(null, !!(!err && value));
		});
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_get(key, field, callback) {
		this.db.collection(key).findOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, callback);
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param value
	 * @param callback
	 */
	_set(key, field, value, callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.collection(key).replaceOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, value, {upsert: true}, callback);
	}

	/**
	 *
	 * @param key
	 * @param field
	 * @param callback
	 */
	_delete(key, field, callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.collection(key).deleteOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, callback);
	}

	/**
	 * @param callback
	 */
	_clear(callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.dropDatabase(callback);
	}
}

module.exports = More;
