var cors_proxy = require('cors-anywhere');

// Configure CORS Anywhere options
var options = {
  originWhitelist: [], // Allow all origins
};

// Create the CORS Anywhere server
var server = cors_proxy.createServer(options);

// Start the server
server.listen(8080, 'localhost', function() {
  console.log('CORS Anywhere proxy server started!');
});


