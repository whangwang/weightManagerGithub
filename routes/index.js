var express = require('express');
var router = express.Router();
var User = require('../models/users.js')
var Coupon = require('../models/coupon.js')
var async = require('async');
var moment = require('moment');
const nodemailer = require("nodemailer");
var fs = require("fs");
const config = require('./config.js');


router.use('/users', require('./users.js'));
router.use('/api', require('./api.js'));


let transporter = nodemailer.createTransport({
	host: "nccu.edu.tw",
	port: 25,
	secure: false
});

router.get('/logout', (req, res, next) => {
	req.session.destroy();
	res.redirect('/');
});

router.get('/importCsv', (req, res, next) => {
	fs.readFile("coupon.csv", 'utf8', function(err, data) {
		var dataArray = data.split(/\r?\n/);
		async.each(dataArray, function(line, callback){
			Coupon.insert({
				productName: line.split(',')[0],
			    expiryDate: line.split(',')[1],
			    url: line.split(',')[2],
			    authCode: line.split(',')[3]
			}, (err, rsp) => {
				if (err) console.log(err);
			});
		});
	})
});

router.use(function(req, res, next) {
	if (typeof req.session.userId == 'undefined') {
		next();
	} else {
		if (typeof req.session.user == 'undefined') {
			User.detail({
				_id: req.session.userId
			}, (err, rsp) => {
				if (err) {
					next(err);
				} else {
					req.session.user = rsp;
					res.redirect('/users/dash');
				}
			});
		} else {
			res.redirect('/users/dash');
		}
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/ajax_register', function(req, res, next) {
	User.insert(req.body, (err, rsp) => {
		if (err) {
			console.dir(err);
			if (err.name === 'MongoError' && err.code === 11000) {
				res.json({
					status: false,
					msg: '此email已註冊過'
				});
			} else {
				res.json({
					status: false,
					msg: err
				});
			}
		} else {
			async.waterfall([
				function(next) {
					next(null, {
						secret: makeid(10),
						email: rsp.account
					});
				},
				function(data, next) {
					User.update({
						_id: rsp._id
					}, {
						validSecret: data.secret
					}, (err1, rst) => {
						next(err1, data);
					});
				}
			], function(err, data) {
				res.render('layouts/mail',{
					url: config.domain + 'verify/' + rsp._id + '/' + data.secret
				}, (err, html) => {
					transporter.sendMail({
					  	from: '"註冊認證" <104703002@nccu.edu.tw>', // sender address
					  	to: data.email, // list of receivers
					  	subject: '政大體重管理系統 - 感謝您的註冊！', // Subject line
					  	html: html,
					}, (err, info) => {
						if (err) {
							console.dir(err);
							res.json({
								status: false,
								msg: err
							});
						} else {
							res.json({
								status: true,
								email: data.email
							});
						}
					})
				});
				/*
				if (err) {
					console.dir(err);
					res.json({
						status: false,
						msg: err
					});
				} else {
					res.json({
						status: true,
						email: data.email
					});
				}
				*/
			});
		}
	});
});

router.post('/ajax_login', (req, res, next) => {
	User.detail({
		account: req.body.account,
		password: req.body.password,
		emailValid: true
	}, (err, rsp) => {
		if (err) {
			res.json({
				status: false,
				msg: err
			});
		} else {
			if (rsp) {
				req.session.userId = rsp._id.toString();
				req.session.user = rsp;
				req.session.admin = false;
				res.json({
					status: true
				});
			} else {
				res.json({
					status: false,
					msg: '此帳密不存在或尚未開通'
				});
			}
		}
	});
});


router.get('/needVerify', function(req, res, next) {
	res.render('user/needVerify', { title: 'Express', email: req.query.email });
});

router.get('/verify/:_id/:secret', function(req, res, next) {
	User.findOneAndUpdate({
		_id: req.params._id,
		validSecret: req.params.secret
	}, {
		emailValid: true
	}, {
		new: true
	}, (err, rsp) => {
		if (err) {
			console.dir(err);
			next(err);
		} else {
			if (rsp) {
				res.render('user/verify', { title: 'Express', rnd: makeid(10) });
			} else {
				res.send('此連結錯誤');
			}
		}
	})
});


// router.get('/admin/selectUser', function(req, res, next) {
// 	cele = (req.query.suc) ? true : false;
// 	res.render('admin/selectUser', { title: 'Express', cele: cele });
// });

// router.get('/admin/inputData', function(req, res, next) {
// 	cele = (req.query.suc) ? true : false;
// 	res.render('admin/inputData', { title: 'Express', cele: cele });
// });

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
