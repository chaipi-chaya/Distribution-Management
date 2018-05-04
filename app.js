'use strict';

const express = require('express');
const app =  express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const customersController = require('./controllers/customersController');
const branchsController = require('./controllers/branchsController');
const productsController = require('./controllers/productsController');
const productsEachBranchController = require('./controllers/productsEachBranchController');
const deliveryQueueController = require('./controllers/deliveryQueueController');
const routePredictionController = require('./controllers/routePredictionController');


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
routePredictionController(app, con);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log('listening on port 3000!'));