module.exports = function(app, con) {
    
    app.get('/branchs/product_management/:idbranch-:branchname-:customername', function (req, res) {
        
        con.query('SELECT * FROM branchs_products INNER JOIN products ON branchs_products.idproduct = products.id AND branchs_products.idbranch = "' + req.params.idbranch + '";',
            function(err, rows) {
                if(err) throw err;
                var branchs_products = rows;
                con.query('SELECT * FROM products',
                    function(err, rows) {
                        if(err) throw err;
                        res.render('pages/product_management', {
                            branchs_products: branchs_products,
                            products: rows,
                            branchId: req.params.idbranch,
                            branchName: req.params.branchname,
                            customerName: req.params.customername
                        });
                    }
                );
            }
        );
        
    });
    
    app.post('/branchs/product_management/add', function (req, res) {

        var branchs_products = {
            idbranch : req.body.idbranch,
            idproduct : req.body.idproduct
        };
        
        if (branchs_products.idbranch && branchs_products.idproduct) {
            con.query('INSERT INTO branchs_products (idbranch, idproduct) VALUES ("' + branchs_products.idbranch + '", "' + branchs_products.idproduct + '");',
                function(err) {
                    if(err) throw err;
                    res.redirect(req.get('referer'));
                }
            );
        }
        
    });
    
    app.post('/branchs/product_management/del', function (req, res) {
        
        con.query('DELETE FROM branchs_products WHERE idbranchs_products =' + req.body.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );
        
    });
    
    app.post('/branchs/product_management/edit', function (req, res) {

        var branchs_products = {
            id : req.body.id,
            idbranch : req.body.idbranch,
            idproduct : req.body.idproduct
        };
        
        con.query('UPDATE branchs_products SET idbranch = ' + branchs_products.idbranch + ', idproduct = "' + branchs_products.idproduct + '" WHERE idbranchs_products = ' + branchs_products.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );
        
    });

}



