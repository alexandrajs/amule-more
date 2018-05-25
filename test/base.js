/* global describe, it, beforeEach */
"use strict";
/**
 * @author Michał Żaloudik <ponury.kostek@gmail.com>
 */
const AMule = require("amule");
const More = require("../");
const assert = require("assert");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let db;
let client;
[
	false,
	true
].forEach((enforceObjectID) => {
	const ObjectID = enforceObjectID ? mongodb.ObjectID : _ => _;
	describe("CRUD " + JSON.stringify({enforceObjectID}), () => {
		before((done) => {
			MongoClient.connect("mongodb://localhost:27017/amule_more_test_db", {}, (err, _client) => {
				if (err) {
					return done(err);
				}
				client = _client;
				db = client.db("amule_more_test_db");
				done();
			});
		});
		after(async () => {
			await client.close();
		});
		beforeEach((done) => {
			db.dropDatabase(() => {
				done();
			});
		});
		it("has", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectID}));
			mule.has("key", "000000000000000000000000", function (err, has) {
				assert.strictEqual(err, null);
				assert.strictEqual(has, false);
				db.collection("key", (err, col) => {
					if (err) {
						return done(err);
					}
					col.insertOne({_id: ObjectID("000000000000000000000000")}).then(() => {
						mule.has("key", "000000000000000000000000", function (err, has) {
							assert.strictEqual(err, null);
							assert.strictEqual(has, true);
							done();
						});
					}).catch(done);
				});
			});
		});
		it("set with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectID}));
			mule.set("key", "000000000000000000000000", "value", (err) => {
				assert.strictEqual(err, null);
				mule.has("key", "000000000000000000000000", (err, has) => {
					assert.strictEqual(err, null);
					assert.strictEqual(has, false);
					done();
				});
			});
		});
		it("set", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {
				readOnly: false,
				enforceObjectID
			}));
			mule.set("key", "000000000000000000000000", {value: "value"}, (err) => {
				assert.strictEqual(err, null);
				mule.has("key", "000000000000000000000000", (err, has) => {
					assert.strictEqual(err, null);
					assert.strictEqual(has, true);
					done();
				});
			});
		});
		it("get", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectID}));
			mule.has("key", "000000000000000000000000", function (err, has) {
				assert.strictEqual(err, null);
				assert.strictEqual(has, false);
				db.collection("key", (err, col) => {
					if (err) {
						return done(err);
					}
					col.insertOne({
						_id: ObjectID("000000000000000000000000"),
						v: "value"
					}).then(() => {
						mule.get("key", "000000000000000000000000", function (err, res) {
							assert.strictEqual(err, null);
							assert.strictEqual(res.v, "value");
							done();
						});
					}).catch(done);
				});
			});
		});
		it("delete with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectID}));
			db.collection("key", (err, col) => {
				if (err) {
					return done(err);
				}
				col.insertOne({
					_id: ObjectID("000000000000000000000000"),
					v: "value"
				}).then(() => {
					mule.has("key", "000000000000000000000000", (err, has) => {
						assert.strictEqual(err, null);
						assert.strictEqual(has, true);
						mule.delete("key", "000000000000000000000000", function (err) {
							assert.strictEqual(err, null);
							mule.has("key", "000000000000000000000000", (err, has) => {
								assert.strictEqual(err, null);
								assert.strictEqual(has, true);
								done();
							});
						});
					});
				}).catch(done);
			});
		});
		it("delete", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {
				readOnly: false,
				enforceObjectID
			}));
			db.collection("key", (err, col) => {
				if (err) {
					return done(err);
				}
				col.insertOne({
					_id: ObjectID("000000000000000000000000"),
					v: "value"
				}).then(() => {
					mule.has("key", "000000000000000000000000", (err, has) => {
						assert.strictEqual(err, null);
						assert.strictEqual(has, true);
						mule.delete("key", "000000000000000000000000", function (err) {
							assert.strictEqual(err, null);
							mule.has("key", "000000000000000000000000", (err, has) => {
								assert.strictEqual(err, null);
								assert.strictEqual(has, false);
								done();
							});
						});
					});
				}).catch(done);
			});
		});
		it("clear with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectID}));
			db.collection("key", (err, col) => {
				if (err) {
					return done(err);
				}
				col.insertOne({
					_id: ObjectID("000000000000000000000000"),
					v: "value"
				}).then(() => {
					mule.has("key", "000000000000000000000000", (err, has) => {
						assert.strictEqual(err, null);
						assert.strictEqual(has, true);
						mule.clear(function (err) {
							assert.strictEqual(err, null);
							mule.has("key", "000000000000000000000000", (err, has) => {
								assert.strictEqual(err, null);
								assert.strictEqual(has, true);
								done();
							});
						});
					});
				}).catch(done);
			});
		});
		it("clear", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {
				readOnly: false,
				enforceObjectID
			}));
			db.collection("key", (err, col) => {
				if (err) {
					return done(err);
				}
				col.insertOne({
					_id: ObjectID("000000000000000000000000"),
					v: "value"
				}).then(() => {
					mule.has("key", "000000000000000000000000", (err, has) => {
						assert.strictEqual(err, null);
						assert.strictEqual(has, true);
						mule.clear(function (err) {
							assert.strictEqual(err, null);
							mule.has("key", "000000000000000000000000", (err, has) => {
								assert.strictEqual(err, null);
								assert.strictEqual(has, false);
								done();
							});
						});
					});
				}).catch(done);
			});
		});
		it("stats", (done) => {
			let mule = new AMule();
			const more = new More(db, {enforceObjectID});
			mule.use(more);
			mule.get("key", "000000000000000000000000", function (err, value) {
				assert.strictEqual(err, null);
				assert.strictEqual(value, null);
				const stats = more.getStats();
				assert.strictEqual(stats.misses, 1);
				assert.strictEqual(stats.ratio, 0);
				assert.strictEqual(stats.hits, 0);
				db.collection("key", (err, col) => {
					if (err) {
						return done(err);
					}
					col.insertOne({
						_id: ObjectID("000000000000000000000000"),
						v: "value"
					}).then(() => {
						assert.strictEqual(err, null);
						mule.get("key", "000000000000000000000000", function (err, val) {
							assert.strictEqual(err, null);
							assert.strictEqual(val.v, "value");
							let stats = more.getStats(true);
							assert.strictEqual(stats.misses, 1);
							assert.strictEqual(stats.ratio, 0.5);
							assert.strictEqual(stats.hits, 1);
							stats = more.getStats();
							assert.strictEqual(stats.misses, 0);
							assert(Number.isNaN(stats.ratio));
							assert.strictEqual(stats.hits, 0);
							done();
						});
					}).catch(done);
				});
			});
		});
	});
});
