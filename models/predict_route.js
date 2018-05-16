module.exports = function(data, trucks, ids, times, priorities) {
    
    return new Promise((resolve, reject) => {
        var kmeans = require('node-kmeans');
        kmeans.clusterize(data, {k: trucks}, (err,res) => {
            if (err) console.error(err);
            for (var i = 0; i < res.length; i++) {
                var id = [];
                var time = [];
                var priority = [];
                var index = res[i].clusterInd;
                for (let j = 0; j < index.length; j++) {
                    id.push(parseInt(ids[index[j]]));
                    time.push(parseInt(times[index[j]]));
                    priority.push(parseInt(priorities[index[j]]));
                }
                res[i].id = id;
                res[i].time = time;
                res[i].priority = priority;
            }

            resolve(res);
        });
    });
    
    

}