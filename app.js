var http = require('http');
var fs = require('fs');

http.createServer(functiocn(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	var html = fs.readFileSync(__dirname + 'index.htm', 'utf8')
	var testMessage = 'test';
	html = html.replace('{testMessage}', testMessage)
}