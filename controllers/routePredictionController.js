var predict = require("../models/predict_route");

module.exports = function(app, con) {
    
    app.get('/routes', function (req, res) {

        con.query('SELECT iddelivery_queue AS id, customers.name AS customer_name, branchs.name AS branch_name, branchs.limitation AS limitation, products.name AS product_name, products.weight_per_bottle AS weight_per_bottle, priority, amount_in_bottle, delivery_queues.idcustomer, delivery_queues.idbranch, delivery_queues.idproduct, branchs.location_lat AS location_lat, branchs.location_lon AS location_lon FROM delivery_queues LEFT JOIN customers ON delivery_queues.idcustomer = customers.idcustomer LEFT JOIN branchs ON delivery_queues.idbranch = branchs.id LEFT JOIN products ON delivery_queues.idproduct = products.id ORDER BY iddelivery_queue;',
            function(err, rows) {
                if(err) throw err;
                res.render('pages/route_prediction', {
                    delivery_queues: rows
                });
            }
        );

    });
    
    app.post('/routes/predict', async function (req, res) {
        
        var queues = req.body;
        var ids = queues.id.split(',');
        var priorities = queues.priorities.split(',');
        var rounds = queues.rounds;
        var data = [];
        var times = [];
        for (let i = 0; i < ids.length; i++) {
            data.push({'id':ids[i],'lat':queues['location_'+ids[i]].split(',')[0],'lon':queues['location_'+ids[i]].split(',')[1]});
            var val = [queues['time_'+ids[i]]].join();
            times.push(val[val.length-1] + val[0]);
        }
        
        var vectors = new Array();
        for (let i = 0 ; i < data.length ; i++) {
            vectors[i] = [ data[i]['lat'] , data[i]['lon']];
        }
        
        var result_id = [];
        var result_con = [];
        var prediction = await predict(vectors, rounds, ids, times, priorities);
        for (let i = 0; i < prediction.length; i++) {
            var time = prediction[i].time;
            var id = prediction[i].id;
            var priority = prediction[i].priority;
            var con = [];
            if (time.indexOf("00") && time.indexOf("11")) {
                var morn = 0;
                var even = 0
                for (let j = 0; j < time.length; j++) {
                    con.push(0);
                    (time[j] == '00') ? morn++;
                    (time[j] == '11') ? even++;
                }
                if (morn > even) {
                    while (time.indexOf('11') != -1) {
                        var index = time.indexOf('11');
                        if (priority[index] != 4) {
                            con[index] = 1;
                        } else {
                            con[index] = 999;
                        }
                        
                    }
                }
            }
        }
        
        console.log(prediction);
        var results = [];
        res.send(results);
        
    });
    
}