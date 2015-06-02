/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var url = require('url');
var fs = require('fs');
var path = require('path');
var qs = require('querystring');

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;


  var filePath = './' + url.parse(request.url, true).pathname;

  // createdAt|objectId|roomname|text|updatedAt|username

  if (fs.existsSync(filePath) === false) {

    headers['Content-Type'] = "text/plain";

    statusCode = 404;

    returnStr = "404";

    response.writeHead(statusCode, headers);

    response.end(returnStr);

    return;
  }

  var returnStr = fs.readFileSync(filePath, {encoding: 'utf-8'});

  var userMessageObj;
  if (request.method === 'POST') {
    var body = '';
    request.on('data', function (data) {
      body += data;

      // Too much POST data, kill the connection!
      if (body.length > 1e6)
          request.connection.destroy();

      userMessageObj = JSON.parse(body);

    });

    request.on('end', function () {

      var fileContentsObj = JSON.parse(returnStr);

      //fileContentsObj.results.push(userMessageObj);
      fileContentsObj.results.unshift(userMessageObj);

      returnStr = JSON.stringify(fileContentsObj);

      fs.writeFileSync(filePath, returnStr, {encoding: 'utf-8'});

      headers['Content-Type'] = "application/json";

      statusCode = 201;

      response.writeHead(statusCode, headers);

      response.end(returnStr);

      return;
    });

  }
  else //if (request.method == 'GET')
  {

    //get the file
    //open the file
    //parse file that we send in
    //create the object

    if(filePath === ".//favicon.ico")
    {
      //filePath = ".//classes/messages";
      response.writeHead(200, {'Content-Type' : 'image/x-icon'});
      response.end();
    }


    //console.log(returnObj);

    //returnObj = JSON.parse(returnObj);

    //console.log(returnObj);



    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    //headers['Content-Type'] = "text/plain";
    headers['Content-Type'] = "application/json";

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.


    response.end(returnStr);
    //response.end("hello world");

    return;
  }

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
