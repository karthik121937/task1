var express = require('express');
var router = express.Router();
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
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

start_DB('127.0.0.1:27017', 'TaskDB', '', '', function (err, db) {

    var server_sTime = mhd.m;
    var ALL_STATS = db.collection("ALL_STATS");
    var hr_stats = db.collection("hr_stats");
    var min_stats = db.collection("min_stats");

    /*ALL_STATS.insertOne({
        _id:"server_STime",
        time:server_sTime
    },function () {
        console.log("came1")
        hr_stats.insertOne({
            _id:"server_STime",
            time:server_sTime
        },function () {
            console.log("came2")
            min_stats.insertOne({
                _id:"server_STime",
                time:server_sTime
            },function () {
                console.log("came3")

            })
        })
    });*/
    function srcStats(source,dur) {
        console.log("durr",dur)
        ALL_STATS.findAndModify({
            _id: source}, [], {$inc: {requests: 1}},{upsert:true},function (err, res) {
            res = res.value;
            var prev_req=(res && res.requests)?res.requests:0;
            var prev_avg=(res && res.avg)?res.avg:0;
            var curr_avg=prev_avg?(prev_avg*prev_req+dur)/(prev_req+1):dur;
            ALL_STATS.update({_id:source},{$set:{avg:curr_avg}},function () {

            })
        });
        ALL_STATS.findAndModify({
            _id: "overall"}, [], {$inc: {requests: 1}},{upsert:true},function (err, res) {
            res = res.value;
            var prev_req=(res && res.requests)?res.requests:0;
            var prev_avg=(res && res.avg)?res.avg:0;
            var curr_avg=prev_avg?(prev_avg*prev_req+dur)/(prev_req+1):dur;
            ALL_STATS.update({_id:"overall"},{$set:{avg:curr_avg}},function () {

            })
        });
        hr_stats.findAndModify({
            hour: mhd.h,source:source}, [], {$inc: {requests: 1}},{upsert:true},function (err, res) {
            res = res.value;
            var prev_req=(res && res.requests)?res.requests:0;
            var prev_avg=(res && res.avg)?res.avg:0;
            var curr_avg=prev_avg?(prev_avg*prev_req+dur)/(prev_req+1):dur;
            hr_stats.update({hour: mhd.h,source:source},{$set:{avg:curr_avg}},function () {

            })
        });
        min_stats.findAndModify({
            minute: mhd.m,source:source}, [], {$inc: {requests: 1}},{upsert:true},function (err, res) {
            res = res.value;
            var prev_req=(res && res.requests)?res.requests:0;
            var prev_avg=(res && res.avg)?res.avg:0;
            var curr_avg=prev_avg?(prev_avg*prev_req+dur)/(prev_req+1):dur;
            min_stats.update({minute: mhd.m,source:source},{$set:{avg:curr_avg}},function () {

            })
        });


    }

    router.get('/stats', function(request, response) {
        response.sendFile(path.resolve(__dirname,'../views/stats.html'));
    });
    router.get('/getStats', function(request, response) {
        ALL_STATS.find({}).toArray(function (err,res) {
            if(err){
                console.log(err);
                response.status(500).send({message: 'Db Error'});
            }
            else{
                hr_stats.find({}).toArray(function (err,hourRes) {
                    if(err){
                        console.log(err);
                        response.status(500).send({message: 'Db Error'});
                    }
                    else{
                        min_stats.find({}).toArray(function(err,minstats){
                            if(err){
                                console.log(err);
                                response.status(500).send({message: 'Db Error'});
                            }
                            else{
                                response.status(200).send({overall: res, hourstats: hourRes, minstats: minstats});
                            }
                        });
                    }
                });
            }
        });
    });

    router.get('/process/*', function(request, response) {
        // console.log(request)

        if(request.method === 'GET'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            srcStats("GET",dur)
            setTimeout(function () {
            var output = {
                "time":parseInt(new Date().getTime()/1000),
                "method" :request.method,
                "headers":request.headers,
                "path":request.url,
                "query":request.query,
                "duration":dur
            }
            response.json(output);
            },dur)

        }
    });
    router.post('/process/*', function(request, response) {
        // console.log(request)

        if(request.method === 'POST'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            srcStats("POST",dur);
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
    router.put('/process/*', function(request, response) {
        // console.log(request)

        if(request.method === 'PUT'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            srcStats("PUT",dur);
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
    router.delete('/process/*', function(request, response) {
        // console.log(request)
        if(request.method === 'DELETE'){
            var dur = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
            srcStats("DELETE",dur);

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

