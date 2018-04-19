'use strict';

var express = require('express');
var app =  express();
var path = require('path');
var mysql = require('mysql');

var customersController = require('./controllers/customersController');
var branchsController = require('./controllers/branchsController');
var productsController = require('./controllers/productsController');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/content'));
    
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "distributiondb"
});

customersController(app, con);
branchsController(app, con);

var port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port 3000!'));