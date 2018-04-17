'use strict';

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/content'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
	
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "distributiondb"
	});
	
	con.query('SELECT * FROM branchs',
		function(err, rows) {
			if(err) throw err;
            console.log(rows)
			console.log(rows[0].name);
            res.send(rows[0].name);
		}
	);
	
});

app.get('/customers', function (req, res) {
	
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "distributiondb"
	});
    
	con.query('SELECT * FROM customers ORDER BY idcustomer',
		function(err, rows) {
			if(err) throw err;
            var idList = [];
            for (var i=0; i < rows.length; i++) idList.push(rows[i].idcustomer);
            res.render('pages/customers', {
                customers: rows,
                idList: idList
            });
		}
	);
    
    
});

app.post('/customers/add', function (req, res) {
    
    var customer = {
        id : req.body.id,
        name: req.body.name
    };
    
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "distributiondb"
	});
    
    if (!customer.id) {
        customer.id = null;
    }
    
    if (customer.name) {
        con.query('INSERT INTO customers (idcustomer, name) VALUES (' + customer.id + ',"' + customer.name + '");',
            function(err, rows) {
                if(err) throw err;
            }
        );
    }
    
    res.redirect(req.get('referer'));
    
});

app.post('/customers/del', function (req, res) {
    
    var customer = {
        id : req.body.id,
    };
    
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "distributiondb"
	});
    
    con.query('DELETE FROM customers WHERE idcustomer=' + customer.id + ';',
        function(err, rows) {
            if(err) throw err;
        }
    );
    
    res.redirect(req.get('referer'));
    
});

app.post('/customers/edit', function (req, res) {
    
    var customer = {
        oldId : req.body.oldId,
        id : req.body.id,
        name: req.body.name
    };
    
	var con = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root",
		database: "distributiondb"
	});
    
    if (!customer.id) {
        customer.id = null;
    }
    
    con.query('UPDATE customers SET idcustomer = ' + customer.id + ', name = "' + customer.name + '" WHERE idcustomer = ' + customer.oldId + ';',
        function(err, rows) {
            if(err) throw err;
            res.redirect(req.get('referer'));
        }
    );
    
});

var port = process.env.PORT || 3000;


app.listen(port, () => console.log('listening on port 3000!'));