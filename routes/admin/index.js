var express = require('express');
var router = express.Router();
var User = require('../../models/users.js');
var Notification = require('../../models/notification')
var moment = require('moment');

let REGISTERPOINT = 50;
let FIRSTPASSPOINTS = 200;
let FIRSTFAILEDPOINTS = 50;
let SECONDPASSPOINTS = 100;
let SECONDFAILEDPOINTS = 50;
let THIRDPASSPOINTS = 250;
let THIRDFAILEDPOINTS = 20;

router.get('/login', (req, res, next) => {
    res.render('admin/index', { title: 'Express' });
});

router.post('/ajax_login', (req, res, next) => {
    if (req.body.account == 'admin' && req.body.password == '123456') {
        req.session.admin = true;
        res.json({
            status: true
        });
    } else {
        res.json({
            status: false
        });
    }
});

router.use((req, res, next) => {
    if (typeof req.session.admin == 'undefined' || !req.session.admin) {
        res.render('admin/index', { title: 'Express' });
    } else {
        next();
    }
});

router.get('/selectUser', function(req, res, next) {
    cele = (req.query.suc) ? true : false;
    res.render('admin/selectUser', { title: 'Express', cele: cele });
});

router.get('/refresh_coupon', function(req,res,next){
    Coupon.update({},{
        awardedUser:null
    },function(err,rsp){
        if(err){
            console.log(err);
        } else {
            res.json(rsp)
        }
    })
})

router.get('/inputData', function(req, res, next) {
    cele = (req.query.suc) ? true : false;
    User.detail({
        account: req.query.account
    }, (err, rsp) => {
        if (err) {
            console.dir(err);
        } else {
            if (rsp) {
                res.render('admin/inputData', { title: 'Express', cele: cele, user: rsp, empty: false });
            } else {
                res.render('admin/selectUser');
            }
        }
    });
});

router.post('/ajax_save_measure', (req, res, next) => {
    User.detail({
        _id: req.body.user_id
    }, (err, rsp) => {
        console.dir(moment(rsp.measureLogs[0].measureDate).diff(moment(req.body.measureDate), 'days'));
        if (err) {
            res.json({
                status: false,
                msg: err
            });
        } else {
            if (rsp.oriWeight == 0) {  //第一次測量體重
                User.update({
                    _id: req.body.user_id
                }, {
                    oriWeight: Number(req.body.weight),
                    oriHeight: Number(req.body.height),
                    points:REGISTERPOINT,
                    $push: {
                        measureLogs: {
                            measureDate: req.body.measureDate,
                            weight: Number(req.body.weight),
                            height: Number(req.body.height)
                        },
                        transactionLogs: {
                            points:REGISTERPOINT,
                            inorout:true,
                            transactionMessage:"成功註冊"
                        }
                    }
                }, (err1, rtn) => {
                    if (err1) {
                        console.dir(err1);
                        res.json({
                            status: false,
                            msg: '存檔失敗'
                        });
                    } else {
                        Notification.insert({
                            type:1,
                            user:req.body.user_id,
                            description:"恭喜您已完成第一次量測！"
                        },function(err,rsp){
                            if(err){
                                console.log(err);
                                res.json({
                                    status: false,
                                    msg: '存取通知失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        })
                    }
                });
            } else {
                if (moment(rsp.measureLogs[0].measureDate).diff(moment(req.body.measureDate), 'days') > -14 && !rsp.twoWeekGoal) {
                    if ((rsp.oriWeight-1) >= Number(req.body.weight) && !rsp.twoWeekGoal) {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:FIRSTPASSPOINTS,
                                    inorout:true,
                                    transactionMessage:"成功達成目標"
                                }
                            },
                            $inc: {
                                points:FIRSTPASSPOINTS
                            },
                            twoWeekGoal: true,
                            achieved: true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                Notification.insert({
                                    type:1,
                                    user:req.body.user_id,
                                    description:"恭喜您達成兩個禮拜減重之目標！"
                                },function(err,rsp){
                                    if(err){
                                        console.log(err);
                                        res.json({
                                            status: false,
                                            msg: '存取通知失敗'
                                        });
                                    } else {
                                        res.json({
                                            status: true
                                        });
                                    }
                                })
                            }
                        });
                    } else {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                }
                            },
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    }
                } else if ((moment(rsp.measureLogs[0].measureDate).diff(moment(req.body.measureDate), 'days') > -30 || rsp.twoWeekGoal) && !rsp.oneMonthGoal) {
                    if ((rsp.oriWeight*0.95) >= Number(req.body.weight) && !rsp.oneMonthGoal) {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:SECONDPASSPOINTS,
                                    inorout:true,
                                    transactionMessage:"成功達成目標"
                                }
                            },
                            $inc: {
                                points:SECONDPASSPOINTS
                            },
                            oneMonthGoal: true,
                            achieved: true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                Notification.insert({
                                    type:1,
                                    user:req.body.user_id,
                                    description:"恭喜您達成一個月減重之目標！"
                                },function(err,rsp){
                                    if(err){
                                        console.log(err);
                                        res.json({
                                            status: false,
                                            msg: '存取通知失敗'
                                        });
                                    } else {
                                        res.json({
                                            status: true
                                        });
                                    }
                                })
                            }
                        });
                    } else if(!rsp.twoWeekGoalFailed && !rsp.twoWeekGoal) {  //尚未領取兩週失敗獎勵
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:FIRSTFAILEDPOINTS,
                                    inorout:true,
                                    transactionMessage:"未達成目標之激勵點數"
                                }
                            },
                            $inc: {
                                points:FIRSTFAILEDPOINTS
                            },
                            twoWeekGoalFailed:true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    } else {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                }
                            }
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    }
                } else if ((moment(rsp.measureLogs[0].measureDate).diff(moment(req.body.measureDate), 'days') > -90 || rsp.oneMonthGoal) && !rsp.threeMonthGoal) {
                    if ((rsp.oriWeight*0.9) >= Number(req.body.weight) && !rsp.threeMonthGoal) {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:THIRDPASSPOINTS,
                                    inorout:true,
                                    transactionMessage:"成功達成目標"
                                }
                            },
                            $inc: {
                                points:THIRDPASSPOINTS
                            },
                            threeMonthGoal: true,
                            achieved: true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                Notification.insert({
                                    type:1,
                                    user:req.body.user_id,
                                    description:"恭喜您達成三個月減重之目標！"
                                },function(err,rsp){
                                    if(err){
                                        console.log(err);
                                        res.json({
                                            status: false,
                                            msg: '存取通知失敗'
                                        });
                                    } else {
                                        res.json({
                                            status: true
                                        });
                                    }
                                })
                            }
                        });
                    } else if(!rsp.oneMonthGoal && !rsp.oneMonthGoalFailed){
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:SECONDFAILEDPOINTS,
                                    inorout:true,
                                    transactionMessage:"未達成目標之激勵點數"
                                }
                            },
                            $inc: {
                                points:SECONDFAILEDPOINTS
                            },
                            oneMonthGoalFailed:true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    } else {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                }
                            }
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    }
                } else {  // 超出三個月了，檢查是否有發過失敗點數等
                    if(!rsp.threeMonthGoal && !rsp.threeMonthGoalFailed){
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                },
                                transactionLogs: {
                                    points:THIRDFAILEDPOINTS,
                                    inorout:true,
                                    transactionMessage:"未達成目標之激勵點數"
                                }
                            },
                            $inc: {
                                points:THIRDFAILEDPOINTS
                            },
                            threeMonthGoalFailed:true
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    } else {
                        User.updateOne({
                            _id: req.body.user_id
                        }, {
                            $push: {
                                measureLogs: {
                                    measureDate: req.body.measureDate,
                                    weight: Number(req.body.weight),
                                    height: Number(req.body.height)
                                }
                            },
                        }, (err1, rtn) => {
                            if (err) {
                                console.dir(err1);
                                res.json({
                                    status: false,
                                    msg: '存檔失敗'
                                });
                            } else {
                                res.json({
                                    status: true
                                });
                            }
                        });
                    }
                }
            }
        }
    });
});


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = router;
