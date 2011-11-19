var http = require('http');
var fs = require('fs');
var url = require('url');
var fileWhitelist = {};

function serveFile(response, path, contentType) {
    fs.readFile(path, function(error, content) {
        if (error) {
            console.log("failed to read file: " + path);
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

function whitelistFile(requestedPath, contentType) {
    fileWhitelist[requestedPath] = { 
        contentType: contentType, 
        requestedPath: requestedPath, 
        fileSystemPath: "." + requestedPath 
    };
}

function isWhitelistedFile(requestedPath) {
    return fileWhitelist[requestedPath] !== undefined;
}

function serveWhitelistFile(requestedPath, response) {
    var file = fileWhitelist[requestedPath];
    if (file !== undefined) {
        serveFile(response, file.fileSystemPath, file.contentType);
    }
}

whitelistFile('/index.html', 'text/html');
whitelistFile('/styles.css', 'text/css');
whitelistFile('/client.js', 'text/javascript');
whitelistFile('/favicon.ico', 'image/vnd.microsoft.icon');
whitelistFile('/postit_small.png', 'image/png');

http.createServer(function (request, response) {

    var requestedPath = url.parse(request.url).pathname

    console.log('request starting for path ' + requestedPath);

    if (requestedPath == '/') {
        serveWhitelistFile('/index.html', response);
    }
    else if (requestedPath == '/board') {
        sendBoard(response);
    }
    else if (isWhitelistedFile(requestedPath)) {
        serveWhitelistFile(requestedPath, response);
    }
    else {
        response.writeHead(404);
        response.end();
    }


    // if (requestedPath == '/postit_small.png') {
    //     serveFile(response, './postit_small.png', 'image/png');
    // }
    // if (requestedPath == '/client.js') {
    //     serveFile(response, './client.js', 'text/javascript');
    // }
    // else if (requestedPath == '/styles.css') {
    //     serveFile(response, './styles.css', 'text/css');
    // }
    // else if (requestedPath == '/favicon.ico') {
    //     serveFile(response, './favicon.ico', 'image/vnd.microsoft.icon');
    // }
    // if (requestedPath == '/board') {
    //     sendBoard(response);
    // }
    // else {
    //     serveFile(response, './index.html', 'text/html');
    // }

}).listen(8080);



console.log('Server running at http://127.0.0.1:8080/');