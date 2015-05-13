var express = require('express');
var router = express.Router();
var operate = require('../operations.js');

var pages;
var POSTS_PER_PAGE = 4;
operate.count("posts", function(err, nEntries) {
	if(err) throw err;
	pages = operate.getNum(nEntries, POSTS_PER_PAGE);
});
/* GET home page. */
router.get('/', function(req, res, next) {
	var nPage = 1;
	if(req.query.page !== undefined)
		nPage = parseInt(req.query.page);
	if(nPage > pages || nPage < 1) throw new Error('bad page number');

	operate.getPage(nPage, POSTS_PER_PAGE, function(err, posts) {
		if(err) throw err;
		res.render('index', { title: 'Blog', posts: posts, pages: pages, currentPage: nPage });
	});
	
});

router.get('/signin', function(req, res, next) {
	res.render('signin', { title: 'Sign in' });
});

router.get('/signup', function(req, res, next) {
	res.render('signup', { title: 'Sign up' });
});

router.post('/signup', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	operate.addUser(username, password, function(err){
		if(err) throw err;
		res.redirect('/signin');
	});
});

router.post('/signin', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	console.log('trying to sign in', req.body);
	operate.authenticate(username, password, function(err, user) {
		if(err) throw err;
		if(!user) {
			res.redirect('/signin');
		}
		else {
			res.cookie('name', username, { expires: new Date(Date.now() + 900000), signed: true});
			res.redirect('/');
		}
	});
});

router.get('/logout', function(req, res, next) {
	res.clearCookie('name');
	res.redirect('/signin');
})

router.get('/write', function(req, res, next) {
	res.render('write', { title: 'Write' });
});

router.post('/write', function(req, res) {
	var title = req.body.title;
	var author = req.body.author;
	var text = req.body.post_text;
	operate.writePost(title, author, text, function(err) {
		if(err) throw err;
		res.redirect('/write');
	});
});

router.get('/search', function(req, res, next) {
	res.render('search', { title: 'Search' });
});

router.post('/search', function(req, res, next) {
	var criteria = req.body.searchBy;
	var value = req.body.textValue;
	if(criteria === 'dateInit') {
		value = req.body.initDate;
	}
	var endDate;
	if(req.body.hasEnd === 'true')
		endDate = req.body.endDate;
	operate.searchPost(criteria, value, endDate, function(err, results) {
		if(err) throw err;
		res.render('results', { title: 'Results', results: results, crit: criteria, val: value });
	});
});

module.exports = router;
