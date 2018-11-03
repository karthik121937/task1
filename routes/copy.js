var express = require('express');
var router = express.Router();
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
function start_DB(host, db, username, password, cb) {
    var url = "mongodb://" + host + "/" + db;
    MongoClient.connect(url, function (err, db_conn) {
        if (err) {
            cb(err);
        }
        else {
            if (username, password) {
                db_conn.admin().authenticate(username, password, function (err, res) {
                    if (err) {
                        console.error(err.stack);
                        process.exit(0);
                    } else {
                        db = db_conn;
                        console.log("got connection");
                        assert.equal(null, err);
                        console.log("Connected correctly to server");
                        cb(null, db);
                    }
                });
            } else {
                cb(null, db_conn);
            }

        }
    });
}
function getMHD(day) {
    var dd = day.getDate();
    var MM = day.getMonth();
    var hh = day.getHours();
    var mm = day.getMinutes();

    var yyyy = day.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (MM < 10) {
        MM = '0' + MM;
    }
    day = new Date(yyyy, MM, dd).getTime() / 1000;
    hour = new Date(yyyy, MM, dd, hh).getTime() / 1000;
    minute = new Date(yyyy, MM, dd, hh, mm).getTime() / 1000;
    return {m: minute, h: hour, d: day};
}
var mhd = getMHD(new Date());
/* GET home page. */

start_DB('127.0.0.1', 'TaskDB', '', '', function (err, db) {

    var request_stats = db.collection("ALL_STATS");
    function stats_fun(incDoc,source,dur_t) {
        request_stats.update({_id: mhd.h}, {
            $inc: incDoc,
            $set: {updated_on: parseInt(Date.now() / 1000)}
        }, {upsert: true}, function (err, ok) {
            if (err) {
                // cb(err);
                console.error(err.stack);
                process.exit(0);
            } else {
                // cb(null, "ok");
            }
        });
        request_stats.update({_id: mhd.m}, {
            $inc: incDoc,
            $set: {updated_on: parseInt(Date.now() / 1000)}
        }, {upsert: true}, function (err, ok) {
            if (err) {
                // cb(err);
                console.error(err.stack);
                process.exit(0);
            } else {
                // cb(null, "ok");
            }
        });
        request_stats.update({_id: source}, {
            $inc: incDoc,
            $push:{duration:dur_t},
            $set: {updated_on: parseInt(Date.now() / 1000)}
        }, {upsert: true}, function (err, ok) {
            if (err) {
                // cb(err);
                console.error(err.stack);
                process.exit(0);
            } else {
                // cb(null, "ok");
            }
        });
    }

    router.get('/process/*', function(request, response) {
        // console.log(request)

        if(request.method === 'GET'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            stats_fun({requests:1},"Total");
            stats_fun({requests:1},"GET",dur);
            // setTimeout(function () {
            var output = {
                "time":parseInt(new Date().getTime()/1000),
                "method" :request.method,
                "headers":request.headers,
                "path":request.url,
                "query":request.query,
                "duration":dur
            }
            response.json(output);
            // },dur)

        }
    });
    router.post('/process/!*', function(request, response) {
        // console.log(request)
        stats_fun({requests:1},"Total");
        stats_fun({requests:1},"POST");
        if(request.method === 'POST'){
            var dur = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
            setTimeout(function () {
                var output = {
                    "time":parseInt(new Date().getTime()/1000),
                    "method" :request.method,
                    "headers":request.headers,
                    "path":request.url,
                    "query":request.query,
                    "body":request.body,
                    "duration":dur
                }
                response.json(output);
            },dur)

        }
    });
    router.put('/process/!*', function(request, response) {
        // console.log(request)
        stats_fun({requests:1},"Total");
        stats_fun({requests:1},"PUT");
        if(request.method === 'PUT'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            // setTimeout(function () {
            var output = {
                "time":parseInt(new Date().getTime()/1000),
                "method" :request.method,
                "headers":request.headers,
                "path":request.url,
                "query":request.query,
                "body":request.body,
                "duration":dur
            }
            response.json(output);
            // },dur)

        }
    });
    router.delete('/process/!*', function(request, response) {
        // console.log(request)
        stats_fun({requests:1},"Total");
        stats_fun({requests:1},"DELETE");
        if(request.method === 'DELETE'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            setTimeout(function () {
                var output = {
                    "time":parseInt(new Date().getTime()/1000),
                    "method" :request.method,
                    "headers":request.headers,
                    "path":request.url,
                    "query":request.query,
                    "body":request.body,
                    "duration":dur
                }
                response.json(output);
            },dur)

        }
    });

});
module.exports = router;

