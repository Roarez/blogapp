var level = require('level');
var posts = require('./initial-posts');
var db = level('/tmp/blogdb',{createIfMissing: true});
var options = [];

for(var i = 1; i < posts.length+1; i++) {
	var value = JSON.stringify(posts[i-1]);
	var key = 'post'+(i < 10 ? "0" : "")+i;
	var opt = {type: 'put', key: key, value: value};
	options.push(opt);
}

db.createReadStream()
	.on('data', function (data) {
		console.log('deleting:', data.key);
		db.del(data.key, function(err) {
			if (err) throw err;
			console.log('success');
		});
			})
	.on('error', function (err) {
		console.log('Oh my!', err)
	})
	.on('close', function () {
		console.log('Stream closed')
	})
	.on('end', function () {
		console.log('deleted all keys');
		db.batch(options, function(err) {
			if(err) throw err;
			console.log('New keys in, closing database');
		});
		console.log('Stream ended');
	})


