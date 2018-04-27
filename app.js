'use strict';

var express = require('express');
var app =  express();
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var customersController = require('./controllers/customersController');
var branchsController = require('./controllers/branchsController');
var productsController = require('./controllers/productsController');
var productsEachBranchController = require('./controllers/productsEachBranchController');
var deliveryQueueController = require('./controllers/deliveryQueueController');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/content'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
    
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "distributiondb"
});

customersController(app, con);
branchsController(app, con);
productsController(app, con);
productsEachBranchController(app, con);
deliveryQueueController(app, con);

var port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port 3000!'));