module.exports = function(app, con) {
    
    app.get('/products', function (req, res) {
        
        con.query('SELECT * FROM products ORDER BY id',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/products', {
                    products: rows
                });
            }
        );
        
    });

    app.post('/products/add', function (req, res) {

        var product = {
            idproduct : req.body.idproduct,
            name: req.body.name,
            weight_per_bottle : req.body.weight,
            minimum_order_per_bottle : req.body.minimum
        };
        
        if (!product.idproduct) {
            product.idproduct = null;
        }
        
        if (product.name && product.weight_per_bottle && product.minimum_order_per_bottle) {
            con.query('INSERT INTO products (id, idproduct, name, weight_per_bottle, minimum_order_per_bottle) VALUES (NULL, "' + product.idproduct + '", "' + product.name + '", "' + product.weight_per_bottle + '", "' + product.minimum_order_per_bottle + '");',
                function(err) {
                    if(err) throw err;
                    res.redirect(req.get('referer'));
                }
            );
        }

    });

    app.post('/products/del', function (req, res) {

        var product = {
            id : req.body.id,
        };

        con.query('DELETE FROM products WHERE id=' + product.id + ';',
            function(err) {
                if(err) throw err;
            }
        );

        res.redirect(req.get('referer'));

    });

    app.post('/products/edit', function (req, res) {

        var product = {
            id : req.body.id,
            idproduct : req.body.idproduct,
            name: req.body.name,
            weight_per_bottle: req.body.weight,
            minimum_order_per_bottle: req.body.minimum
        };

        if (!product.idproduct) {
            product.idproduct = null;
        }

        con.query('UPDATE products SET idproduct = ' + product.idproduct + ', name = "' + product.name + '", weight_per_bottle = "' + product.weight_per_bottle + '", minimum_order_per_bottle = "' + product.minimum_order_per_bottle + '" WHERE id = ' + product.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });


}