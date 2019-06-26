let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let User = new Schema({
    account: { type: String, unique: true },
    password: { type: String },
    age: { type: Number },
    gender: { type: String },
    points: { type: Number },
    oriWeight: { type: Number, default: 0 },
    oriHeight: { type: Number, default: 0 },
    createDate: { type: Date, default: Date.now },
    measureLogs: [{
        measureDate: { type: Date, default: Date.now },
        weight: { type: Number },
        height: { type: Number }
    }],
    transactionLogs: [{
        transactionDate: { type: Date, default: Date.now },
        points:{ type: Number },
        inorout:{ type:Boolean }, // true in  false out
        transactionMessage:{ type:String }
    }],
    emailValid: { type: Boolean, default: false },
    validSecret: { type: String },
    points: { type: Number, default: 0 },
    achieved: { type: Boolean, default: false },
    twoWeekGoal: { type: Boolean, default: false },
    towWeekGoalFailed:{ type: Boolean, default: false },
    oneMonthGoal: { type: Boolean, default: false },
    oneMonthGoalFailed: { type: Boolean, default: false },
    threeMonthGoal: { type: Boolean, default: false },
    threeMonthGoalFailed: { type: Boolean, default: false },
    coupons: [{ type: String, ref: 'Coupon', default: null }]
});

let Model = mongoose.model('User', User);

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
    populate('coupons').
    exec((err, rsp) => {
        callback(err, rsp);
    });
}


Model.detail = function(data, callback) {
    Model.findOne(data).
    populate('coupons').
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
