var express = require('express');
var router = express.Router();
var User = require('../models/users.js')
var Notification = require('../models/notification');
var Coupon = require('../models/coupon');
var async = require('async');
let coupon_category = require('./config_coupon.json')

router.post('/buy_product', function(req, res, next) {
    let data = {};
    async.waterfall([
        function(callback){   //檢查登入資訊
            if(req.session.userId){
                User.detail({
                    _id:req.session.userId,
                    password:req.body.password
                },function(err,rsp){
                    if(err){
                        console.log(err);
                    } else {
                        if(rsp != null){
                            data.user_info = rsp;
                            callback(null)
                        } else {
                            res.json({
                                status:false,
                                message:"密碼有誤"
                            })
                        }
                    }
                })
            } else {
                res.json({
                    status:false,
                    message:"尚未登入"
                })
            }
        },
        function(callback){  //檢查欲兌換coupon
            Coupon.list({
                productName:req.body.productName,
                user:null
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    if(rsp.length == 0 || rsp == null){
                        res.json({
                            status:false,
                            message:"該商品庫存不足"
                        })
                    } else {
                        callback(null,rsp[0]._id)
                    }
                }
            })
        },
        function(coupon_id,callback){ //檢查餘額
            if(coupon_category[req.body.productName] > data.user_info.points){ //餘額不足
                res.json({
                    status:false,
                    message:"您的點數不足"
                })
            } else {
                Coupon.detail({
                    _id:coupon_id
                },function(err,rsp){
                    if(err){
                        console.log(err);
                    } else {
                        if(rsp.user != null){
                            res.json({
                                status:false,
                                message:"發生錯誤，請重新兌換"
                            })
                        } else {
                            Coupon.update({
                                _id:coupon_id
                            },{
                                awardedUser:req.session.userId
                            },function(err,rsp){
                                if(err){
                                    console.log(err);
                                } else {
                                    callback(null);
                                }
                            })
                        }
                    }
                })
            }
        },
        function(callback){
            User.update({
                _id:req.session.userId
            },{
                points:data.user_info.points - coupon_category[req.body.productName],
                $push:{
                    transactionLogs:{
                        points:coupon_category[req.body.productName],
                        inorout:false, // true in  false out
                        transactionMessage:"兌換優惠卷 " + req.body.productName
                    }
                }
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    res.json({
                        status:true
                    })
                }
            })
        },
    ],function(err){
        if(err){
            console.log(err);
        }
    })
})

router.post('/transfer_point', function(req, res, next) {
    let export_points = 0;
    let import_points = 0;
    async.waterfall([
        function(callback){ // 檢查點數
            User.detail({
                _id:req.session.userId
            },function(err,rsp){
                if(err){
                    console.log(er);
                } else {
                    if(rsp == null){
                        res.json({
                            status:false,
                            message:"請先登入"
                        })
                    } else {
                        export_points = rsp.points;
                        if(req.body.point > rsp.points){ //餘額不足
                            res.json({
                                status:false,
                                message:"點數不足"
                            })
                        } else {
                            callback(null);
                        }
                    }
                }
            })
        },
        function(callback){  //檢查轉入帳號
            User.detail({
                account:req.body.account
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    if(rsp == null){
                        res.json({
                            status:false,
                            message:"轉入帳號有誤"
                        })
                    } else {
                        import_points = rsp.points;
                        callback(null);
                    }
                }
            })
        },
        function(callback){  //更新export
            User.update({
                _id:req.session.userId
            },{
                points:export_points - req.body.point,
                $push:{
                    transactionLogs:{
                        points:req.body.point,
                        inorout:false, // true in  false out
                        transactionMessage:"轉讓點數給 " + req.body.account
                    }
                }
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    callback(null)
                }
            })
        },
        function(callback){
            User.update({
                account:req.body.account
            },{
                points:import_points + req.body.point,
                $push:{
                    transactionLogs:{
                        points:req.body.point,
                        inorout:true, // true in  false out
                        transactionMessage:"收到點數從 " + req.session.userId
                    }
                }
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    callback(null)
                }
            })
        },
        function(callback){
            res.json({
                status:true,
            })
        }
    ],function(err){
        console.log(err)
    })
});

module.exports = router;
