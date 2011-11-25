var http = require('http');
var fs = require('fs');
var url = require('url');
var board = [];
var path = require('path');

var contentTypes = {
    'css': 'text/css',
    'js': 'text/javascript',
    'png': 'image/png',
    'ico': 'image/vnd.microsoft.icon'
};

function serveFile(response, filePath) {
    var extension = path.extname(filePath);

    if (extension.indexOf('.') == 0) {
        extension = extension.substr(1);
    }

    var contentType = contentTypes[extension];

    fs.readFile(filePath, function(error, content) {
        if (error) {
            console.log("failed to read file: " + filePath);
            response.writeHead(500);
            response.end();
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}

function serveUnvalidatedPath(requestedPath, response) {

    if (requestedPath.indexOf('/') == 0) {
        requestedPath = requestedPath.substr(1);
    }
    
    fs.realpath(requestedPath, function (error, realPath) {
        if (error) {
            console.log('could not resolve path: ' + requestedPath);
            response.writeHead(404);
            response.end();
        } else if (realPath.indexOf(__dirname) !== 0) { // File is outside of script file directory
            console.log('file outside root was requested: ' + realPath);
            response.writeHead(403);
            response.end();
        } else {
            console.log('serving file: ' + realPath);
            serveFile(response, realPath);
        }
    });
}

function sendBoard(response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(board), 'utf-8');
}

function saveBoard(filePath) {
    filePath = filePath !== undefined ? filePath : "./kanban.txt";

    var output = "";
    for (var i = 0; i < board.length; i++) {
        var swimlane = board[i];

        output += swimlane.name + "\n";

        var underline = swimlane.name.split("")
            .map(function (c) { return "=" })
            .reduce(function (x, y) {
                return x + y;
            }, "");

        output += underline + "\n";;

        for (var j = 0; j < swimlane.postits.length; j++) {
            output += "* " + swimlane.postits[j] + "\n";
        }

        output += "\n";
    }

    fs.writeFile(filePath, output, function(error) {
        if (error) {
            console.log("error writing board to file: " + filePath);
        }
    });
}

function deletePostit(text, response) {
    console.log("Deleting postit: " + text);

    response.writeHead(200);
    response.end();

    var result = findPostit(text);
    board[result.swimlaneIndex].postits.splice(result.postitIndex, 1);

    saveBoard();
}

function findPostit(text) {
    for (var i = 0; i < board.length; i++) {
        var swimlane = board[i];

        for (var j = 0; j < swimlane.postits.length; j++) {
            var postit = swimlane.postits[j];
            if (postit === text) {
                return { swimlaneIndex: i, postitIndex: j };
            }
        }
    }
}

fs.readFile("kanban.txt", function(error, content) {
    var lines = content.toString().replace(/\r/g, "").split('\n');
    var swimlane = null;

    for (var i = 0; i < lines.length; i++) {

        // Is it a swimlane header?
        if (i < lines.length - 1 && lines[i+1].indexOf("===") == 0) {
            swimlane = {
                "name": lines[i],
                "postits" : []
            }

            board.push(swimlane);
        }
        // non empty and non separator line
        else if (lines[i].indexOf("* ") == 0) {
            swimlane["postits"].push(lines[i].substring(2));
        }
    }
});

http.createServer(function (request, response) {

    var parseQueryString = true;
    var requestedUrl = url.parse(request.url, parseQueryString);
    var requestedPath = requestedUrl.pathname
    var queryString = requestedUrl.query;

    console.log('request starting for path ' + requestedPath);

    if (requestedPath == '/') {
        serveFile(response, 'index.html');
    }
    else if (requestedPath == '/board') {
        sendBoard(response);
    }
    else if (requestedPath == '/postit' && request.method == "DELETE") {
        deletePostit(decodeURI(queryString.text), response);
    }
    else {
        serveUnvalidatedPath(requestedPath, response);
    }
}).listen(8080);

console.log('Server running at http://127.0.0.1:8080/');