var level = require('level');
var db = level('/tmp/blogdb');
var page = parseInt(process.argv[2] || '1');
var PAGE_SIZE = 2;

function getPage(nPage, cb) {
	var startKey = (nPage * PAGE_SIZE)-(PAGE_SIZE-1) //(1*2)-(2-1) = 2-(1) = 2-1 = 1
	var endKey = nPage * PAGE_SIZE
	startKey = 'post' + (startKey < 10 ? '0' : '') + startKey;
	endKey = 'post' + (endKey < 10 ? '0' : '') + endKey;
	db.createReadStream({start: startKey, end: endKey})
	.on('data', function (data) {
		console.log(data.key, '=', JSON.parse(data.value))
	})
	.on('error', function (err) {
		cb(err)
		console.log('Oh my!', err)
	})
	.on('close', function () {
		console.log('Stream closed')
	})
	.on('end', function () {
		console.log('Stream closed')
})

}
getPage(page, function(err, posts) {
	console.log(err, posts);
});
