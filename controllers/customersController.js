var bodyParser = require('body-parser');

module.exports = function(app, con) {
    
    app.use(bodyParser.json());
    
    app.get('/customers', function (req, res) {

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

        if (!customer.id) {
            customer.id = null;
        }

        if (customer.name) {
            con.query('INSERT INTO customers (idcustomer, name) VALUES (' + customer.id + ',"' + customer.name + '");',
                function(err) {
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

        con.query('DELETE FROM customers WHERE idcustomer=' + customer.id + ';',
            function(err) {
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

        if (!customer.id) {
            customer.id = null;
        }

        con.query('UPDATE customers SET idcustomer = ' + customer.id + ', name = "' + customer.name + '" WHERE idcustomer = ' + customer.oldId + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });

}