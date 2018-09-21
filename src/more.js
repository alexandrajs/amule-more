"use strict";
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const Layer = require("amule").Layer;
const mongodb = require("mongodb");

class More extends Layer {
	/**
	 *
	 * @param {mongodb.Db} db
	 * @param {Object} [options]
	 * @param {boolean} [options.enforceObjectID]
	 * @param {boolean} [options.readOnly]
	 */
	constructor(db, options) {
		super();
		/**
		 *
		 */
		if (!db) {
			throw new TypeError("'db' must be instance of 'mongodb.Db'");
		}
		this.options = Object.assign({
			enforceObjectID: false,
			readOnly: true
		}, options || {});
		this.db = db;
	}

	/**
	 *
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
	 */
	_has(key, field, callback) {
		this.db.collection(key).findOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, (err, value) => {
			callback(null, !!(!err && value));
		});
	}

	/**
	 *
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
	 */
	_get(key, field, callback) {
		this.db.collection(key).findOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, callback);
	}

	/**
	 *
	 * @param {string} key
	 * @param {string} field
	 * @param {*} value
	 * @param {function} callback
	 */
	_set(key, field, value, callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.collection(key).replaceOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, value, {upsert: true}, callback);
	}

	/**
	 *
	 * @param {string} key
	 * @param {string} field
	 * @param {function} callback
	 */
	_delete(key, field, callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.collection(key).deleteOne({_id: this.options.enforceObjectID ? new mongodb.ObjectId(field) : field}, callback);
	}

	/**
	 * @param {function} callback
	 */
	_clear(callback) {
		if (this.options.readOnly) {
			return callback(null, false);
		}
		this.db.dropDatabase(callback);
	}
}

module.exports = More;
