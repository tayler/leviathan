#! /usr/bin/env node

// usage: `node leviathan [100] [www.example.com] [80] [/] [GET]`

// args[2] == number of requests
// args[3] == host // don't include 'http://' or trailing slash (path goes in args[5])
// args[4] == port
// args[5] == path
// args[6] == method

var args = process.argv;
var requests = args[2] || 1;

var Leviathan = function() {

	"use strict";

	var HTTP = require("http"),
		Q = require("q"),
		options = {
			hostname: args[3] || 'hiitworkout.s3-website-us-east-1.amazonaws.com',
			port: args[4] || 80,
			path: args[5] || '/',
			method: args[6] || 'GET'
		};

	var markTime = function() {
		var newDate = new Date();

		return newDate.getTime();
	};

	var oneRequest = function(iteration) {
		var deferred = Q.defer(),
			startTime = markTime();

		var req = HTTP.request(options, function(res) {
			console.log('=======Iteration #' + iteration + '=======');
			console.log('STATUS: ' + res.statusCode);
			// console.log('HEADERS: ' + JSON.stringify(res.headers));
			var endTime = markTime(),
				requestDetails = {
					iteration: iteration,
					reqStatus: res.statusCode,
					reqStart: startTime,
					reqEnd: endTime,
					duration: endTime - startTime
				};
			// console.log(requestDetails);
			// the value passed into .then() after Q.all() is an array containing each promise returned by this function;
			deferred.resolve(requestDetails);
		});
		req.on('error', function(e) {
			deferred.reject(e.message);
			console.log('there was an error making request number ' + iteration + ': ' + e.message);
		});
		req.end();
		return deferred.promise;
	};

	var buildRequests = function(requestCount) {
		var calls = [],
			i;
		for (i = 1; i <= requestCount; i++) {
			calls.push(oneRequest(i));
		}
		return calls;
	};

	this.runRequests = function(requestCount) {
		var calls = buildRequests(requestCount);
		var callsBeganAt = markTime();

		Q.all(calls)
		.then(function(results) {
			var durationTotals = 0;
			var durations = [];
			var callsEndedAt = markTime();

			console.log(results);
			console.log('Total time to finish all calls: ' + (callsEndedAt - callsBeganAt) / 1000 + ' second(s)');
			results.forEach(function(result) {
				durations.push(result.duration);
				durationTotals += result.duration;
			});
			var averageDuration = (durationTotals / requests);
			var avgSeconds = averageDuration / 1000;
			console.log('Average request duration: ' + avgSeconds + ' second(s)');

			// simple d3 bar chart for charting `durations`: http://jsfiddle.net/kaKuZ/1/
			// bar chart tutorial: http://mbostock.github.io/d3/tutorial/bar-1.html
			console.log(durations);
		}, function(error) {
			console.log('there was an error in one of the requests');
		});
	};
};

var leviathan = new Leviathan();

leviathan.runRequests(requests);







