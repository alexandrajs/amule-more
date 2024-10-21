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
].forEach((enforceObjectId) => {
	const getId = enforceObjectId ? (id) => new mongodb.ObjectId(id) : _ => _;
	describe("CRUD " + JSON.stringify({enforceObjectId}), () => {
		before((done) => {
			MongoClient.connect("mongodb://localhost:27017/admin", {auth:{password:'root', username:"root"}}).then((_client) => {
				client = _client;
				db = client.db("amule_more_test_db");
				done();
			}).catch((e)=>{
				console.log(e);done(e)
			});
		});
		after(async () => {
			await client.close();
		});
		beforeEach((done) => {
			db.dropDatabase().finally(done);
		});
		it("has", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectId}));
			mule.has("key", "000000000000000000000000", function (err, has) {
				assert.strictEqual(err, null);
				assert.strictEqual(has, false);

				const col = db.collection("key");

				col.insertOne({_id: getId("000000000000000000000000")}).then(() => {
					mule.has("key", "000000000000000000000000", function (err, has) {
						assert.strictEqual(err, null);
						assert.strictEqual(has, true);
						done();
					});
				}).catch(done);
			});
		});
		it("set with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectId}));
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
				enforceObjectId
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
			mule.use(new More(db, {enforceObjectId}));
			mule.has("key", "000000000000000000000000", function (err, has) {
				assert.strictEqual(err, null);
				assert.strictEqual(has, false);
				const col = db.collection("key");
				col.insertOne({
					_id: getId("000000000000000000000000"),
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
		it("delete with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectId}));
			const col = db.collection("key");
			col.insertOne({
				_id: getId("000000000000000000000000"),
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
		it("delete", () => {
			let mule = new AMule();
			mule.use(new More(db, {
				readOnly: false,
				enforceObjectId
			}));
			const col = db.collection("key");
			return col.insertOne({
				_id: getId("000000000000000000000000"),
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

						});
					});
				});
			});
		});
		it("clear with readOnly:true", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {enforceObjectId}));
			const col = db.collection("key");
			col.insertOne({
				_id: getId("000000000000000000000000"),
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
		it("clear", (done) => {
			let mule = new AMule();
			mule.use(new More(db, {
				readOnly: false,
				enforceObjectId
			}));
			const col = db.collection("key");
			col.insertOne({
				_id: getId("000000000000000000000000"),
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
		it("stats", (done) => {
			let mule = new AMule();
			const more = new More(db, {enforceObjectId});
			mule.use(more);
			mule.get("key", "000000000000000000000000", function (err, value) {
				assert.strictEqual(err, null);
				assert.strictEqual(value, null);
				const stats = more.getStats();
				assert.strictEqual(stats.misses, 1);
				assert.strictEqual(stats.ratio, 0);
				assert.strictEqual(stats.hits, 0);
				const col = db.collection("key");
				col.insertOne({
					_id: getId("000000000000000000000000"),
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
