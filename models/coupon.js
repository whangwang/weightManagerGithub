let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Coupon = new Schema({
    productName: { type: String },
    expiryDate: { type: String },
    url: { type: String },
    authCode: { type: String },
    awardedUser: { type: String, ref: 'User', default: null },
    used:{ type:Boolean, default:false },
    point:{ type:Number, default:200 }
});

let Model = mongoose.model('Coupon', Coupon);

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
