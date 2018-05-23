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
        
        var results = [];
        var move_list = [];
        var prediction = await predict(vectors, rounds, ids, times, priorities);
        for (let i = 0; i < prediction.length; i++) {
            var time = prediction[i].time;
            var id = prediction[i].id;
            var priority = prediction[i].priority;
            var centroid = prediction[i].centroid;
            var cluster = prediction[i].cluster;
            var period = "";
            var condition = [];
            var move = {};
            var result = {};
            // have both morn and even
            console.log(id);
            console.log(time);
            if (time.indexOf("0") && time.indexOf("11")) {
                var morn = 0;
                var even = 0
                for (let j = 0; j < time.length; j++) {
                    condition.push(0);
                    if (time[j] == '0') { morn++; }
                    if (time[j] == '11') { even++; }
                }
                if (morn > even) {
                    period = "morn";
                    while (time.indexOf('11') != -1) {
                        var index = time.indexOf('11');
                        if (priority[index] == 2) {
                            condition[index] = 1;
                            // drop move from id
                            id.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 3) {
                            condition[index] = 2;
                            move.id = id[index];
                            move.type = "mornToEven";
                            move.cluster = cluster[index];
                            move.condition = 2;
                            move.priority = 3;
                            // drop move from id
                            id.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 4) {
                            condition[index] = 999;
                        }
                        move_list.push(move);
                    }
                } else if (even >= morn) {
                    period = "even";
                    while (time.indexOf('0') != -1) {
                        var index = time.indexOf('0');
                        if (priority[index] == 2) {
                            condition[index] = 1;
                            // drop move from id
                            id.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 3) {
                            condition[index] = 2;
                            move.id = id[index];
                            move.type = "evenToMorn";
                            move.cluster = cluster[index];
                            move.condition = 2;
                            move.priority = 3;
                            // drop move from id
                            id.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 4) {
                            condition[index] = 999;
                        }
                        move_list.push(move);
                    }
                    
                }
            // have only morn
            } else if (time.indexOf("0")) {
                period = "morn";
            // have only even
            } else if (time.indexOf("11")) {
                period = "even";
            // have both
            } else if (time.indexOf("10")) {
                period = "both";
            }
            // collect result
            result.id = id;
            result.condition = condition;
            result.priority = priority;
            result.centroid = centroid;
            result.period = period;
            results.push(result);
        }
        
        // move condition == 2 to other list
        for (let i = 0; i < move_list.length; i++) {
            var move = move_list[i];
            var cluster = move.cluster;
            var moveToResultIndex = null;
            var distance = 9999;
            if (move.type == "mornToEven") {
                for (let j = 0; j < results.length; j++) {
                    if (results[i].period == "even" || results[i].period == "both") {
                        var a = cluster[0] - results[i].centroid[0];
                        var b = cluster[1] - results[i].centroid[1];
                        var c = Math.sqrt( a*a + b*b );
                        if (c < distance) {
                            moveToResultIndex = j;
                            distance = c;
                        }
                    }
                }
            } else if (move.type == "evenToMorn") {
                for (let j = 0; j < results.length; j++) {
                    if (results[i].period == "morn" || results[i].period == "both") {
                        var a = cluster[0] - results[i].centroid[0];
                        var b = cluster[1] - results[i].centroid[1];
                        var c = Math.sqrt( a*a + b*b );
                        if (c < distance) {
                            moveToResultIndex = j;
                            distance = c;
                        }
                    }
                }
            }
            results[j].id.push(move.id);
            results[j].priority.push(move.priority);
        }
        
        console.log(results);
        console.log(move_list);
        res.send(results);
        
    });
    
}