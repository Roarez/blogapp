var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/blogapp');
var blogposts = require('./initial-posts');
var data = [];

var collection = db.get("posts");

for(var i = 1; i < blogposts.length+1; i++) {
	var value = blogposts[i-1];
	data.push(value);
}

collection.remove({});

collection.insert(data, function (err, doc) {
	if (err) {
		// If it failed, return error
		throw err;
	}
	else {
		// And forward to success page
		console.log('success');
	}
});