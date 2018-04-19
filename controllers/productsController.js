var bodyParser = require('body-parser');

module.exports = function(app, con) {
    
    app.use(bodyParser.json());
    
    app.get('/products', function (req, res) {
        
        con.query('SELECT * FROM products ORDER BY id',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/products', {
                    products: rows
                });
            }
        );
        
    }


}