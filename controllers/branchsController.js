module.exports = function(app, con) {
    
    app.get('/branchs/:id-:customername', function (req, res) {

        con.query('SELECT * FROM customers_branchs INNER JOIN branchs ON customers_branchs.idbranch = branchs.id AND customers_branchs.idcustomer = "' + req.params.id + '";',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/branchs', {
                    branchs: rows,
                    customerName: req.params.customername,
                    customerId: req.params.id
                });
            }
        );

    });

    app.post('/branchs/add', function (req, res) {

        var branch = {
            idbranch : req.body.idbranch,
            idcustomer : req.body.idcustomer,
            location_lat : req.body.location_lat,
            location_lon : req.body.location_lon,
            name: req.body.name
        };

        if (!branch.idbranch) {
            branch.idbranch = null;
        }

        if (branch.name && branch.location_lat && branch.location_lon) {
            con.query('INSERT INTO branchs (id, idbranch, idcustomer, location_lat, location_lon, name) VALUES (NULL, "' + branch.idbranch + '", ' + branch.idcustomer + ', "' + branch.location_lat + '", "' + branch.location_lon + '", "' + branch.name + '");',
                function(err, result) {
                    if(err) throw err;
                     con.query('INSERT INTO customers_branchs (idcustomers_branchs, idcustomer, idbranch) VALUES (NULL, ' + branch.idcustomer + ', ' + result.insertId + ');',
                        function(err) {
                            if(err) throw err;
                            res.redirect(req.get('referer'));
                        }
                    );
                }
            );
        }

    });

    app.post('/branchs/del', function (req, res) {

        var branch = {
            id : req.body.id,
        };
        
        con.query('DELETE FROM branchs WHERE id=' + branch.id + ';',
            function(err) {
                if(err) throw err;
            }
        );
        con.query('DELETE FROM customers_branchs WHERE idbranch=' + branch.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );


    });

    app.post('/branchs/edit', function (req, res) {

        var branch = {
            id : req.body.id,
            idbranch : req.body.idbranch,
            name: req.body.name,
            location_lat: req.body.location_lat,
            location_lon: req.body.location_lon
        };

        if (!branch.idbranch) {
            branch.idbranch = null;
        }
        
        con.query('UPDATE branchs SET idbranch = ' + branch.idbranch + ', name = "' + branch.name + '", location_lat = "' + branch.location_lat + '", location_lon = "' + branch.location_lon + '" WHERE id = ' + branch.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });

    app.post('/branchs/limitation', function (req, res) {

        var branch = {
            id : req.body.id,
            limitation: req.body.limitation
        };

        con.query('UPDATE branchs SET limitation = "' + branch.limitation.join("/") + '" WHERE id = ' + branch.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });

}
    