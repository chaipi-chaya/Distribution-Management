module.exports = function(app, con) {
    
    app.get('/trucks', function (req, res) {

        con.query('SELECT * FROM trucks ORDER BY idtruck',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/trucks', {
                    trucks: rows
                });
            }
        );

    });

    app.post('/trucks/add', function (req, res) {

        var truck = {
            type : req.body.type,
            maxcapacity_in_kilo: req.body.maxcapacity_in_kilo,
            license_plate: req.body.license_plate
        };
        
        con.query('INSERT INTO trucks (idtruck, type, maxcapacity_in_kilo, license_plate) VALUES (NULL, "' + truck.type + '","' + truck.maxcapacity_in_kilo + '","' + truck.license_plate + '");',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });

    app.post('/trucks/del', function (req, res) {

        var trucks = {
            id : req.body.id,
        };

        con.query('DELETE FROM trucks WHERE idtruck=' + trucks.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );


    });

    app.post('/trucks/edit', function (req, res) {

        var truck = {
            id : req.body.id,
            type : req.body.type,
            maxcapacity_in_kilo: req.body.maxcapacity_in_kilo,
            license_plate: req.body.license_plate
        };

        con.query('UPDATE trucks SET type = "' + truck.type + '", maxcapacity_in_kilo = "' + truck.maxcapacity_in_kilo + '", license_plate = "' + truck.license_plate + '" WHERE idtruck = ' + truck.id + ';',
            function(err) {
                if(err) throw err;
                res.redirect(req.get('referer'));
            }
        );

    });
    
}