let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Notification = new Schema({
    type:{ type:Number }, // 0 all 1 for user
    user:{ type:String,ref:'User',default:null },
    createDate:{ type:Date,default: Date.now },
    description:{ type:String }
});

let Model = mongoose.model('Notification ', Notification );

Model.insert = function(data, callback) {
    Model(data).save((err, rsp) => {
        callback(err, rsp);
    });
};

Model.delete = function(data, callback) {
    Model.remove(data, (err, rsp) => {
        callback(err, rsp);
    });
};


Model.list = function(data, callback) {
    Model.find(data).
    exec((err, rsp) => {
        callback(err, rsp);
    });
}


Model.detail = function(data, callback) {
    Model.findOne(data).
    exec((err, rsp) => {
        callback(err, rsp);
    });
};


Model.has = function(data, callback) {
    Model.findOne(data, (err, rsp) => {
        if (rsp == null) {
            callback(err, false);
        } else {
            callback(err, true);
        }
    });
};

module.exports = Model;
