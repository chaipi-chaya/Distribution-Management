module.exports = function(data, trucks) {
    
    return new Promise((resolve, reject) => {
        var kmeans = require('node-kmeans');
        var prediction = []
        kmeans.clusterize(data, {k: trucks}, (err,res) => {
            if (err) console.error(err);
            for (var i = 0; i < res.length; i++) {
                prediction.push(res[i].clusterInd);
            }

            resolve(prediction);
        });
    });
    
    

}