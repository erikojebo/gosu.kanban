var http = require('http');
var fs = require('fs');
var url = require('url');

function serveFile(response, path, contentType) {
    fs.readFile(path, function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}

function sendBoard(response) {
    var board = [
        {
            "name": "Ready",
            "postits" : ["Do the dishes", "Do the laundry"]
        },
        {
            "name": "In progress",
            "postits" : ["Watch TV", "Surf the web"]
        },
        {
            "name": "Done",
            "postits" : ["Eat dinner"]
        }];

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(board), 'utf-8');
}

http.createServer(function (request, response) {

    var requestedPath = url.parse(request.url).pathname

    console.log('request starting for path ' + requestedPath);

    if (requestedPath == '/styles.css') {
        serveFile(response, './styles.css', 'text/css');
    }
    if (requestedPath == '/favicon.ico') {
        serveFile(response, './favicon.ico', 'image/vnd.microsoft.icon');
    }
    if (requestedPath == '/board') {
        sendBoard(response);
    }
    else {
        serveFile(response, './index.html', 'text/html');
    }

}).listen(8080);



console.log('Server running at http://127.0.0.1:8080/');