var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/blogapp');
var page = parseInt(process.argv[2] || '2');
var PAGE_SIZE = 2;

var postcol = db.get("posts");
/*
postcol.find({},{},function(e,docs){
    console.log(docs);
});*/

function getPage(nPage, perPage, cb) {
    var startKey = (nPage * perPage)-(perPage-1) //(2*2)-(2-1) = 4-(1) = 4-1 = 3
    
    var pagePosts = [];
    var count = startKey;
    var skip = 1;
    postcol.find({},{},function(e,docs){
        docs.forEach(function(doc){
            if(skip >= startKey) {
                if (count < (startKey+perPage)) {
                    pagePosts.push(doc);
                    count++;
                }
            }
            skip++;
        });
        cb(null, pagePosts);
    });/*
    
    cb(null, pagePosts);
    /*
        if (count >= (startKey+perPage)) {
            pagePosts.push(post);
            count++;
        }        
    });*/
    
}


/*
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

}*/
getPage(page, PAGE_SIZE,function(err, posts) {
    console.log(err, posts);
});
