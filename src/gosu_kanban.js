var http = require('http');
var fs = require('fs');
var url = require('url');
var fileWhitelist = {};
var board = [];

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

function saveBoard(path) {
    path = path !== undefined ? path : "./kanban.txt";

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

    fs.writeFile(path, output, function(error) {
        if (error) {
            console.log("error writing board to file: " + path);
        }
    });
}

function deletePostit(text, response) {
    console.log("Deleting postit: " + text);

    response.writeHead(200);
    response.end();

    var result = findPostit(text);
    console.log(JSON.stringify(result));
    board[result.swimlaneIndex].postits.splice(result.postitIndex, 1);

    console.log(JSON.stringify(board));

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

whitelistFile('/index.html', 'text/html');
whitelistFile('/styles.css', 'text/css');
whitelistFile('/client.js', 'text/javascript');
whitelistFile('/favicon.ico', 'image/vnd.microsoft.icon');
whitelistFile('/postit_small.png', 'image/png');

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
        serveWhitelistFile('/index.html', response);
    }
    else if (requestedPath == '/board') {
        sendBoard(response);
    }
    else if (isWhitelistedFile(requestedPath)) {
        serveWhitelistFile(requestedPath, response);
    }
    else if (requestedPath == '/postit' && request.method == "DELETE") {
        deletePostit(decodeURI(queryString.text), response);
    }
    else {
        response.writeHead(404);
        response.end();
    }
}).listen(8080);

console.log('Server running at http://127.0.0.1:8080/');