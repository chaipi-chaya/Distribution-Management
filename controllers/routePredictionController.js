var predict = require("../models/predict_route");

module.exports = function(app, con) {
    
    app.get('/routes', function (req, res) {

        con.query('SELECT iddelivery_queue AS id, customers.name AS customer_name, branchs.name AS branch_name, branchs.limitation AS limitation, products.name AS product_name, products.weight_per_bottle AS weight_per_bottle, priority, amount_in_bottle, delivery_queues.idcustomer, delivery_queues.idbranch, delivery_queues.idproduct, branchs.location_lat AS location_lat, branchs.location_lon AS location_lon FROM delivery_queues LEFT JOIN customers ON delivery_queues.idcustomer = customers.idcustomer LEFT JOIN branchs ON delivery_queues.idbranch = branchs.id LEFT JOIN products ON delivery_queues.idproduct = products.id ORDER BY iddelivery_queue;',
            function(err, rows) {
                if(err) throw err;
                con.query('SELECT * FROM trucks',
                    function(err, trucks) {
                        res.render('pages/route_prediction', {
                            delivery_queues: rows,
                            trucks: trucks
                        });
                    }
                );
            }
        );

    });
    
    app.post('/routes/predict', async function (req, res) {
        
        var queues = req.body;
        var ids = queues.id.split(',');
        var priorities = queues.priorities.split(',');
        var weights = queues.weights.split(',');
        var idtrucks = queues.idtrucks.split(',');
        var rounds = (parseInt(idtrucks.length) * 2) + parseInt(queues.extrarounds);
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
        var prediction = await predict(vectors, rounds, ids, times, priorities, weights);
        for (let i = 0; i < prediction.length; i++) {
            var time = prediction[i].time;
            var id = prediction[i].id;
            var priority = prediction[i].priority;
            var weight = prediction[i].weight;
            var centroid = prediction[i].centroid;
            var cluster = prediction[i].cluster;
            var period = "";
            var condition = [];
            var move = {};
            var result = {};
            // have both morn and even
            if (time.indexOf("0") != -1 && time.indexOf("11") != -1) {
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
                            move.id = id[index];
                            move.weight = weight[index];
                            move.type = "moveToNextDay";
                            move.cluster = cluster[index];
                            move.priority = 2;
                            // drop move from id
                            id.splice(index, 1);
                            weight.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 3) {
                            condition[index] = 2;
                            move.id = id[index];
                            move.weight = weight[index];
                            move.type = "mornToEven";
                            move.cluster = cluster[index];
                            move.condition = 2;
                            move.priority = 3;
                            // drop move from id
                            id.splice(index, 1);
                            weight.splice(index, 1);
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
                            move.weight = weight[index];
                            move.type = "moveToNextDay";
                            move.cluster = cluster[index];
                            move.priority = 2;
                            // drop move from id
                            id.splice(index, 1);
                            weight.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 3) {
                            condition[index] = 2;
                            move.id = id[index];
                            move.weight = weight[index];
                            move.type = "evenToMorn";
                            move.cluster = cluster[index];
                            move.condition = 2;
                            move.priority = 3;
                            // drop move from id
                            id.splice(index, 1);
                            weight.splice(index, 1);
                            condition.splice(index, 1);
                            cluster.splice(index, 1);
                        } else if (priority[index] == 4) {
                            condition[index] = 999;
                        }
                        move_list.push(move);
                    }
                    
                }
            // have only morn
            } else if (time.indexOf(0) != -1) {
                period = "morn";
            // have only even
            } else if (time.indexOf(11) != -1) {
                period = "even";
            // have both
            } else if (time.indexOf(10) != -1) {
                period = "both";
            } else {
                period = "nan";
            }
            // collect result
            result.id = id;
            result.weight = weight;
            result.condition = condition;
            result.priority = priority;
            result.centroid = centroid;
            result.cluster = cluster;
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
            results[moveToResultIndex].id.push(move.id);
            results[moveToResultIndex].priority.push(move.priority);
        }
        
        // assign trucks and move list
        var fin = [];
        var move = {};
        var move_list = [];
        var truckUsage = {};
        while (results.length != 0) {
            var weightRound = 0;
            var indexRound = 0;
            var weightTruck = 0;
            var indexTruck = 0;
            var sumWeight = [];
            /// biggest truck for biggest round 
            //// find biggest round and bigest truck
            for (let i = 0; i < results.length; i++) {
                var sum = results[i].weight.reduce((accumulator, currentValue) => accumulator + currentValue);
                sumWeight.push(sum);
                if (sum > weightRound) {
                    weightRound = sum;
                    indexRound = i;
                }
            }
            var cannotUse = [];
            var truckUsage = {};
            for (let i = 0; i < idtrucks.length; i++) {
                truckUsage[idtrucks[i]] = [];
            }
            while (true) {
                ///// find biggest truck available
                for (let i = 0; i < idtrucks.length; i++) {
                    var truck = queues['truck_'+idtrucks[i]];
                    if (truckUsage[idtrucks[i]].length < 2 && cannotUse.indexOf(i) == -1) {
                        if (truck > weightTruck) {
                            weightTruck = truck;
                            indexTruck = i;
                        }
                    }
                }
                ///// check if it okey to use
                if ((results[indexRound].period == 'morn' && truckUsage[idtrucks[indexTruck]].indexOf('morn') == -1) || (results[indexRound].period == 'even' && truckUsage[idtrucks[indexTruck]].indexOf('even') == -1) || (results[indexRound].period == 'both') ) {
                    break;
                } else {
                    //// no room left
                    cannotUse.push(indexTruck);
                                
                }
            }
            //// assing biggest to biggest
            if (weightTruck >= weightRound) {
                ///// give it a truck
                results[indexRound].truck = idtrucks[indexTruck];
                results[indexRound].vacancy = weightTruck - weightRound;
                ///// save result
                fin.push(results[indexRound]);
            } else {
            //// remove lowest priority
                while (weightRound > weightTruck) {
                    var result = results[indexRound];
                    var priority = result.priority;
                    while ((priority[priority.length - 1] == 1 || priority[priority.length - 1] == 2) || (weightRound > weightTruck)) {
                        if (priority.length == 1) {
                            ///// if last one and weight still larger than truck and priority 
                            if (weightRound > weightTruck) {
                                ///// cut that last one split to two
                                move.id = result.id[0];
                                move.weight = result.weight[0] - weightTruck;
                                move.type = result.period;
                                move.cluster = result.cluster[0];
                                move.priority = priority[0];
                                ///// make new move item
                                ///// change last one
                                result.weight[0] = weightTruck;
                                weightRound = weightTruck;
                            }
                            move_list.push(move);
                            move = {};
                            break;
                        }
                        ///// make new move item
                        move.id = result.id[priority.length - 1];
                        move.weight = result.weight[priority.length - 1];
                        move.type = result.period;
                        move.cluster = result.cluster[priority.length - 1];
                        move.priority = priority[priority.length - 1];
                        move_list.push(move);
                        move = {};
                        ///// drop lowest priority
                        weightRound = weightRound - results[indexRound].weight[priority.length - 1];
                        result.id.splice(priority.length - 1, 1);
                        result.weight.splice(priority.length - 1, 1);
                        result.cluster.splice(priority.length - 1, 1);
                        result.priority.splice(priority.length - 1, 1);
                        ///// add new move to move list
                    }
                    ///// break if it fit
                    if (weightTruck >= weightRound) {
                        ///// give it a truck
                        result.truck = idtrucks[indexTruck];
                        result.vacancy = weightTruck - weightRound;
                        ///// save result
                        fin.push(result);
                    }
               }
            }
            ///// drop result
            results.splice(indexRound, 1);
        }
        
        /// deal with move, same as before but add weight
        var nextDayList = [];
        for (let i = 0; i < move_list.length; i++) {
            var move = move_list[i];
            var cluster = move.cluster;
            var moveToResultIndex = null;
            var distance = 9999;
            var nextDay = move;
            if (move.type == "even") {
                for (let j = 0; j < fin.length; j++) {
                    if ((fin[j].period == "even" || fin[j].period == "both") && fin[j].vacancy > 0) {
                        var a = cluster[0] - fin[j].centroid[0];
                        var b = cluster[1] - fin[j].centroid[1];
                        var c = Math.sqrt( a*a + b*b );
                        if (c < distance) {
                            moveToResultIndex = j;
                            distance = c;
                        }
                    }
                }
            } else if (move.type == "morn") {
                for (let j = 0; j < fin.length; j++) {
                    if ((fin[j].period == "morn" || fin[j].period == "both") && fin[j].vacancy > 0)  {
                        var a = cluster[0] - fin[j].centroid[0];
                        var b = cluster[1] - fin[j].centroid[1];
                        var c = Math.sqrt( a*a + b*b );
                        if (c < distance) {
                            moveToResultIndex = j;
                            distance = c;
                        }
                    }
                }
            } else if (move.type == "both") {
                for (let j = 0; j < fin.length; j++) {
                    if (fin[j].vacancy > 0) {
                        var a = cluster[0] - fin[j].centroid[0];
                        var b = cluster[1] - fin[j].centroid[1];
                        var c = Math.sqrt( a*a + b*b );
                        if (c < distance) {
                            moveToResultIndex = j;
                            distance = c;
                        }
                    }
                }
            }
            
            //// if weight in move is bigger than vacancy
            if (moveToResultIndex) {
                if (move.weight > fin[moveToResultIndex].vacancy) {
                    /// fill all it can
                    fin[moveToResultIndex].id.push(move.id);
                    fin[moveToResultIndex].weight.push(fin[moveToResultIndex].vacancy);
                    fin[moveToResultIndex].cluster.push(move.cluster);
                    fin[moveToResultIndex].priority.push(move.priority);
                    fin[moveToResultIndex].vacancy = 0;
                    /// leftover add to next day
                    nextDay.weight -= fin[moveToResultIndex].vacancy;
                    nextDayList.push(nextDay);
                } else {
                    ///// add move to fin
                    fin[moveToResultIndex].id.push(move.id);
                    fin[moveToResultIndex].weight.push(move.weight);
                    fin[moveToResultIndex].cluster.push(move.cluster);
                    fin[moveToResultIndex].priority.push(move.priority);
                    fin[moveToResultIndex].vacancy -= move.weight;
                }
            } else {
                //// cannot find vacancy, add to nextDay
                nextDayList.push(nextDay);
            }
        }
        res.send([fin,nextDayList]);
        
    });
    
}