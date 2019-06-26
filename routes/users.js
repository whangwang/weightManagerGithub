var express = require('express');
var router = express.Router();
var User = require('../models/users.js')
var Notification = require('../models/notification');
var Coupon = require('../models/coupon');
var async = require('async');
let coupon_category = require('./config_coupon.json')

router.use(function(req, res, next) {
    res.locals.title = "體重量測";
    if ( typeof req.session.userId == 'undefined' ){
    	res.redirect('/');
    } else {
    	next();
    }
});

router.get('/account', function(req, res, next) {
    let data = {};
    data.coupon_category = coupon_category;
    async.waterfall([
        function(callback){
            User.detail({
                _id:req.session.userId
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                     data.measureLogs = rsp.measureLogs.map(function(obj){
                        return obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1)+ '.' + obj.measureDate.getDate()
                    })
                    data.transactionLogs = rsp.transactionLogs.map(function(obj){
                        return {
                            date:obj.transactionDate.getFullYear() + '.' + (obj.transactionDate.getMonth()+1)+ '.' + obj.transactionDate.getDate(),
                            points:obj.points,
                            inorout:obj.inorout,
                            transactionMessage:obj.transactionMessage
                        }
                    })
                    data.transactionLogs.sort((a,b) => a.date < b.date);
                    data.user_info = rsp;
                    callback(null)
                }
            })
        },
        function(callback){
            data.coupon_obj = {
                '7-ELEVEN 100元購物金':[],
                '7-ELEVEN 50元購物金':[],
                '7-ELEVEN 25元購物金':[],
                '誠品生活即享券100元':[],
                '全家購物金100元':[],
                '全家購物金50元':[],
                '全家購物金25元':[],
                '統一時代百貨台北店100元即享券':[],
                '統一時代百貨台北店200元即享券':[],
                '屈臣氏即享券100元':[]
            }
            data.coupon_cate = {
                '7-ELEVEN':['7-ELEVEN 100元購物金', '7-ELEVEN 50元購物金', '7-ELEVEN 25元購物金'], 
                '誠品生活':['誠品生活即享券100元'],
                '全家':['全家購物金100元', '全家購物金50元', '全家購物金25元'],
                '統一時代百貨':['統一時代百貨台北店100元即享券', '統一時代百貨台北店200元即享券'],
                '屈臣氏':['屈臣氏即享券100元']
            };
            data.coupon_to_cate = {
                '7-ELEVEN 100元購物金':'7-ELEVEN',
                '7-ELEVEN 50元購物金':'7-ELEVEN',
                '7-ELEVEN 25元購物金':'7-ELEVEN',
                '誠品生活即享券100元':'誠品生活',
                '全家購物金100元':'全家',
                '全家購物金50元':'全家',
                '全家購物金25元':'全家',
                '統一時代百貨台北店100元即享券':'統一時代百貨',
                '統一時代百貨台北店200元即享券':'統一時代百貨',
                '屈臣氏即享券100元':'屈臣氏'
            }
            data.coupon_to_img = {
                '誠品生活即享券100元': 'https://media.ticketxpress.com.tw/Images/50c79b7d-ccaf-4724-a30f-a8bf26c49913.jpg',
                '統一時代百貨台北店100元即享券': 'https://media.ticketxpress.com.tw/Images/e8786755-8c87-4952-bb63-24eb783d0b19.jpg',
                '統一時代百貨台北店200元即享券': 'https://media.ticketxpress.com.tw/Images/8a015fc3-a9f5-4655-9609-16c5c387fff9.jpg',
                '屈臣氏即享券100元': 'https://media.ticketxpress.com.tw/Images/b32b7523-0451-417b-be0b-3224ea4705ad.jpg'
            }
            data.user_coupon_list = [];
            Coupon.list({},function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    for(let i in rsp){
                        if(rsp[i].awardedUser == null){  //尚未購買
                            if(data.coupon_obj[rsp[i].productName])data.coupon_obj[rsp[i].productName].push(rsp[i]);
                        } else if(rsp[i].awardedUser == req.session.userId){
                            data.user_coupon_list.push(rsp[i]);
                        } else {
                        }
                        if(i == rsp.length - 1){
                            callback(null)
                        }
                    }
                }
            })
        },
        function(callback){
            console.log(data.transactionLogs)
            res.render('user/account', data);
        }
    ],function(err){
        if(err){
            console.log(err);
        } else {

        }
    })
});

router.get('/dash', function(req, res, next) {
    let data = {};
    async.waterfall([
        function(callback){
            User.detail({
                _id:req.session.userId
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                     data.measureLogs = rsp.measureLogs.map(function(obj){
                        return obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1)+ '.' + obj.measureDate.getDate()
                    })
                    data.first_time = (data.measureLogs.length == 0)
                    data.user_info = rsp;
                    callback(null)
                }
            })
        },
        function(callback){
            data.cele = data.achieved;
            callback(null)
        },
        function(callback){
            data.notif_list = [];
            Notification.list({
                type:0
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    data.notif_list = data.notif_list.concat(rsp);
                    callback(null)
                }
            })
        },
        function(callback){
            Notification.list({
                type:1,
                user:req.session.userId
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    data.notif_list = data.notif_list.concat(rsp);
                    callback(null)
                }
            })
        },
        function(callback){
            res.render('user/dashboard', data);
        }
    ],function(err){
        if(err){
            console.log(err);
        } else {

        }
    })
});

router.post('/get_chart',function(req,res,next){
    let data = {};
    async.waterfall([
        function(callback){
            User.detail({
                _id:req.session.userId
            },function(err,rsp){
                if(err){
                    console.log(err);
                } else {
                    data.user_info = rsp;
                    callback(null)
                }
            })
        },
        function(callback){  // 處理chart
            data.labels = data.user_info.measureLogs.map(function(obj){
                return [obj.measureDate.getFullYear(),(obj.measureDate.getMonth()+1) + '.' + obj.measureDate.getDate()]
            })
            callback(null)
        },
        function(callback){
            data.bmi_datasets = data.user_info.measureLogs.map(function(obj){
                return {
                    t:obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1) + '.' + obj.measureDate.getDate(),
                    y:Math.round(obj.weight / ((obj.height/100)*(obj.height/100)) * 10)/10
                }
            })
            data.weight_datasets = data.user_info.measureLogs.map(function(obj){
                return {
                    t:obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1) + '.' + obj.measureDate.getDate(),
                    y:Math.round(obj.weight * 10)/10
                }
            })
            data.min_weight = Math.min.apply(null, data.user_info.measureLogs.map(function(obj){return obj.weight}));
            data.max_weight = Math.max.apply(null, data.user_info.measureLogs.map(function(obj){return obj.weight}));
            data.bmi_bgcolor = data.user_info.measureLogs.map(function(obj){
                return 'rgba(23, 157, 175, 0.2)';
            })
            data.bmi_bdcolor = data.user_info.measureLogs.map(function(obj){
                return 'rgba(23, 157, 175, 1)';
            })
            callback(null);
        },
        function(callback){
            data.overweight_datasets = data.user_info.measureLogs.map(function(obj){
                return {
                    t:obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1) + '.' + obj.measureDate.getDate(),
                    y:24
                }
            })
            data.overweight_bgcolor = data.user_info.measureLogs.map(function(obj){
                return 'rgba(170, 135, 26, 0.2)';
            })
            data.overweight_bdcolor = data.user_info.measureLogs.map(function(obj){
                return 'rgba(170, 135, 26, 1)';
            })
            callback(null);
        },
        function(callback){
            data.lighterweight_datasets = JSON.stringify(data.user_info.measureLogs.map(function(obj){
                return {
                    t:obj.measureDate.getFullYear() + '.' + (obj.measureDate.getMonth()+1) + '.' + obj.measureDate.getDate(),
                    y:18.5
                }
            }))
            data.lighterweight_bgcolor = JSON.stringify(data.user_info.measureLogs.map(function(obj){
                return 'rgba(170, 26, 61, 0.2)';
            }))
            data.lighterweight_bdcolor = JSON.stringify(data.user_info.measureLogs.map(function(obj){
                return 'rgba(170, 26, 61, 1)';
            }))
            callback(null);
        },
        function(callback){
            res.json(data)
        }
    ],function(err){
        console.log(err);
    })
})

module.exports = router;
