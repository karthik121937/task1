var http = require('http');
var url = require('url')
var server = http.createServer(function (request,response) {
    // console.log(request)
    console.log(request.method,"requestttt at time:",parseInt(new Date().getTime()/1000))
    if(request.method === 'GET'){
        var output = {
            "method" :request.method,
            "headers":request.headers,
            "time":parseInt(new Date().getTime()/1000),
            "path":request.url,
            "output":"hi get request"
        }
        response.write(JSON.stringify(output));
        response.end()
    }else if (request.method === 'POST'){

        var params = url.parse(request.url, true).query;
        console.log(params);
        var body = '';
        request.on('data', function (data) {
            body += data;
            // console.log("Partial body: " + body);
        });
        request.on("end",function () {
            console.log(request.body,request.headers,request.url)
            var output = {
                "method" :request.method,
                "headers":request.headers,
                "time":parseInt(new Date().getTime()/1000),
                "path":request.url,
                "body":body,
                "output":"hi post request"
            }
            response.write(JSON.stringify(output));
            response.end()
        });

    }else if (request.method === 'PUT'){
        var output = {
            "method" :request.method,
            "headers":request.headers,
            "time":parseInt(new Date().getTime()/1000),
            "output":"hi PUT request"
        }
        response.write(JSON.stringify(output));
        response.end()
    }else if (request.method === 'DELETE'){
        var output = {
            "method" :request.method,
            "headers":request.headers,
            "time":parseInt(new Date().getTime()/1000),
            "output":"Hi DELETE request"
        }
        response.write(JSON.stringify(output));
        response.end()
    }

    // console.log("method-->",request.method,"\n","headers-->",request.headers);
    // console.log("request time",parseInt(new Date().getTime()/1000))

});
server.listen(10000);
console.log("server startted")