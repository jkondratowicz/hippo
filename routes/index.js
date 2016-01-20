var express = require('express');
var router = express.Router();
var config = require('../config/config');
var request = require('request');
var async = require('async');

var redis =  require("redis").createClient(config.redis.port, config.redis.host, config.redis.options);
redis.on("error", function (err) {
	console.log("Redis error " + err);
});
redis.on("ready", function () {
	console.log("Redis ready");
});

if(config.redis.pass) {
	redis.auth(config.redis.pass, callback);
}

var REDIS_KEY = "TramData";
var REDIS_TTL = 30;

router.get('/', function(req, res, next) {
	res.render('index', {apiKey: config.googleApiKey});
});


router.get('/data.json', function(req, res, next) {
	var cached = false;
	var result = {};
	async.waterfall([
		function(done) {
			// Check in cache
			redis.get(REDIS_KEY, function(err, data) {
				if(err || !data) {
					return done();
				}

				result = data;
				try {
					result = JSON.parse(data);
				} catch(e) {
					return done();
				}

				cached = true;
				return done();
			});
			
		},
		function(done) {
			// Fetch from API
			if(cached) {
				return done();
			}

			var url = "https://api.um.warszawa.pl/api/action/wsstore_get/?id=c7238cfe-8b1f-4c38-bb4a-de386db7e776&apikey=" + config.apiKey;
			request(url, function(error, response, data) {
				console.log("Data fetched from API");
				if(error || response.statusCode !== 200) {
					return done(error);
				}

				try {
					result = JSON.parse(data);
					return done();
				} catch(e) {
					return done("Bad JSON");
				}
			});
		},
		function(done) {
			// Save to cache
			if(cached) {
				return done();
			}

			var value = JSON.stringify(result);

			redis.set(REDIS_KEY, value, function(err, reply) {
				redis.expire(REDIS_KEY, REDIS_TTL, done);
			});
		}
	], function(err) {
		if(err) {
			console.error(err);
			return next(err);
		}

		res.json(result);

	});
});

module.exports = router;