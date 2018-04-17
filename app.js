var express = require('express');
var app = express();
var mysql = require('mysql');

app.get('/', function (req, res) {
    console.log('Request Url:' + req.url);
	
	var con = mysql.createConnection({
		host: "localhost",
		user: "test",
		password: "test",
		database: "distribution"
	});
	
	con.query('SELECT * FROM branchs',
		function(err, rows) {
			if(err) throw err;
			console.log(rows[0].idbranchs);
		}
	);
	
});

var port = process.env.PORT || 3000;


app.listen(port, () => console.log('listening on port 3000!'));