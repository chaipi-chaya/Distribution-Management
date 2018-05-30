module.exports = function(data, rounds, ids, times, priorities, weights) {
    
    return new Promise((resolve, reject) => {
        var kmeans = require('node-kmeans');
        kmeans.clusterize(data, {k: rounds}, (err,res) => {
            if (err) console.error(err);
            for (var i = 0; i < res.length; i++) {
                var id = [];
                var time = [];
                var priority = [];
                var weight = [];
                var index = res[i].clusterInd;
                for (let j = 0; j < index.length; j++) {
                    id.push(parseInt(ids[index[j]]));
                    time.push(parseInt(times[index[j]]));
                    priority.push(parseInt(priorities[index[j]]));
                    weight.push(parseInt(weights[index[j]]));
                }
                res[i].id = id;
                res[i].time = time;
                res[i].priority = priority;
                res[i].weight = weight;
            }
            
            resolve(res);
        });
    });
    
    

}