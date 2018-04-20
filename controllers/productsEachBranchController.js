module.exports = function(app, con) {
    
    app.get('/branchs/product_management/:idbranch-:branchname-:customername', function (req, res) {
        
        con.query('SELECT * FROM branchs_products INNER JOIN products ON branchs_products.idproduct = products.id AND branchs_products.idbranch = "' + req.params.idbranch + '";',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/product_management', {
                    products: rows,
                    branchName: req.params.branchname,
                    customerName: req.params.customername
                });
            }
        );
        
    });

}