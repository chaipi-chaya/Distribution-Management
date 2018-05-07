var predict = require("../models/predict_route");

module.exports = function(app, con) {
    
    app.get('/routes', function (req, res) {

        con.query('SELECT iddelivery_queue AS id, customers.name AS customer_name, branchs.name AS branch_name, branchs.limitation AS limitation, products.name AS product_name, priority, amount_in_bottle, delivery_queues.idcustomer, delivery_queues.idbranch, delivery_queues.idproduct, branchs.location_lat AS location_lat, branchs.location_lon AS location_lon FROM delivery_queues LEFT JOIN customers ON delivery_queues.idcustomer = customers.idcustomer LEFT JOIN branchs ON delivery_queues.idbranch = branchs.id LEFT JOIN products ON delivery_queues.idproduct = products.id ORDER BY iddelivery_queue;',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/route_prediction', {
                    delivery_queues: rows
                });
            }
        );

    });
    
    app.post('/routes/predict', async function (req, res) {
        
        var queues = req.body.for_prediction;
        var rounds = req.body.rounds;
        
        var data = [];
        for (let i = 0 ; i < queues.length ; i++) {
            var queue = queues[i].split('/');
            data.push({'id':queue[0],'lat':queue[1],'lon':queue[2]});
        }
        
        var vectors = new Array();
        for (let i = 0 ; i < data.length ; i++) {
            vectors[i] = [ data[i]['lat'] , data[i]['lon']];
        }
        
        var results = await predict(vectors, rounds);
        res.send(results);
        
    });
    
}