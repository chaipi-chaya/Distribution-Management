module.exports = function(app, con) {
    
    app.get('/deliveries', function (req, res) {

        con.query('SELECT iddelivery_queue AS id, customers.name AS customer_name, branchs.name AS branch_name, products.name AS product_name, priority, amount_in_bottle, delivery_queues.idcustomer, delivery_queues.idbranch, delivery_queues.idproduct FROM delivery_queues LEFT JOIN customers ON delivery_queues.idcustomer = customers.idcustomer LEFT JOIN branchs ON delivery_queues.idbranch = branchs.id LEFT JOIN products ON delivery_queues.idproduct = products.id ORDER BY iddelivery_queue;',
            function(err, delivery_queues) {
                if(err) throw err;
                con.query('SELECT * FROM customers ORDER BY idcustomer',
                    function(err, customers) {
                        res.render('pages/delivery_queues', {
                            delivery_queues: delivery_queues,
                            customers: customers,
                        });
                    }
                );
            }
        );

    });
    
    app.get('/deliveries/getbranch', function (req, res) {
        
        var customer = {
            id : req.query.id
        };
        
        con.query('SELECT branchs.name AS name, branchs.id AS id FROM customers_branchs INNER JOIN branchs ON customers_branchs.idbranch = branchs.id AND customers_branchs.idcustomer = ' + customer.id + ';',
            function(err, rows) {
                if(err) throw err;
                res.send(rows);
            }
        );
        
    });
    
    app.get('/deliveries/getproduct', function (req, res) {
        
        var branch = {
            id : req.query.id
        };
        
        con.query('SELECT products.name AS name, products.id AS id FROM branchs_products INNER JOIN products ON branchs_products.idproduct = products.id AND branchs_products.idbranch = ' + branch.id + ';',
            function(err, rows) {
                if(err) throw err;
                res.send(rows);
            }
        );
        
    });
    
    app.post('/deliveries/add', function (req, res) {

        var delivery_queue = {
            idcustomer : req.body.idcustomer,
            idproduct: req.body.idproduct,
            idbranch: req.body.idbranch,
            priority: req.body.priority,
            amount_in_bottle: req.body.amount_in_bottle
        };
        
        con.query('INSERT INTO delivery_queues (idcustomer, idproduct, idbranch, priority, amount_in_bottle) VALUES (' + delivery_queue.idcustomer + ',' + delivery_queue.idproduct + ',' + delivery_queue.idbranch + ',' + delivery_queue.priority + ',' + delivery_queue.amount_in_bottle + ');',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );
        
    });
    
    app.post('/deliveries/del', function (req, res) {

        var delivery_queue = {
            id : req.body.id,
        };

        con.query('DELETE FROM delivery_queues WHERE iddelivery_queue = ' + delivery_queue.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );
        
    });
    
}