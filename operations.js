var mongo = require('mongodb');
var monk = require('monk');
var bcrypt = require('bcrypt');
var db = monk('localhost:27017/blogapp');
var postcol = db.get("posts");
var usercol = db.get("users");


function collectionCounter(collection, cb) {
    var entries;
    if(collection === "posts") {
        postcol.find({},{},function(e,docs){
            if (e) return cb(e);
            entries = docs.length;
            cb(null, entries);
        });
    }
    if(collection === "users") {
        usercol.find({},{},function(e,docs){
            if (e) return cb(e);
            entries = docs.length;
            cb(null, entries);
        });
    }
}

function getNumPages(nEntries, perPage) {
    var ratio = nEntries%perPage;
    var nPages = ratio === 0 ? nEntries/perPage : ((nEntries-ratio)/perPage)+1;
    return nPages;
}

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
    });
/*
    db.createReadStream({start: startKey, end: endKey})
    .on('data', function (data) {
        posts.push(JSON.parse(data.value));
    })
    .on('error', function (err) {
        cb(err);
    })
    .on('end', function () {
        cb(null, posts);
    });*/
}

function writePost(title, author, text, callback) {
    postcol.insert({"author": author, "title": title, "date": Date.now(), "text": text},
        function (err, doc) {
            if (err) {
                return callback(err);
            }
            else {
                // And forward to success page
                console.log('success');
                callback();
            }
    });
/*
    post = JSON.stringify(post);
    var key;
    postCounter(function(err, nEntries) {
        if(err) return callback(err);
        var next = nEntries+1;
        if(next < 10)
            key = 'post0'+next;
        else
            key = 'post'+next;
        db.put(key, post, callback);
    });*/
}

function searchPost(crit, value, endDate, callback) {
    if (typeof endDate === 'function' && !callback) {
        callback = endDate;
        endDate === null;
    }
    if(crit === 'author') {
        postcol.find({"author": value}, function(e,docs) {
            if (e) return callback(e);
            callback(null, docs);
        });
    }
    if(crit === 'title') {
        postcol.find({"title": value}, function(e,docs) {
            if (e) return callback(e);
            callback(null, docs);
        });
    }
    if(crit === 'dateInit') {
        var time = Number(value);
        var endTime = Number(endDate);
        if(endDate === undefined) {
            postcol.find( {"date": { $gte: time } }, function(e,docs) {
                if (e) return callback(e);
                console.log(docs);
                callback(null, docs);
            });
        }
        else {
            postcol.find( {"date": { $gte: time, $lte: endTime } }, function(e,docs) {
                if (e) return callback(e);
                callback(null, docs);
            });
        }
    }


/*
    var results = [];
    db.createReadStream().on('data', function (data) {
        var current = JSON.parse(data.value);
        if(crit === 'author') {
            if(value === current.author)
                results.push(current);
        }
        if(crit === 'title') {
            if(value === current.title)
                results.push(current);
        }
        if(crit === 'dateInit') {
            if(endDate === undefined) {
                if(value <= current.date)
                    results.push(current);
            }
            else {
                if(value <= current.date && endDate >= current.date)
                    results.push(current);
            }
        }
    }).on('error', function (err) {
        if (callback) {
            callback(err);
            callback = null;
        }
    }).on('end', function () {
        if (callback) {
            callback(null, results);
            callback = null;
        }
    });*/
}

function addUser(username, password, callback) {
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) return callback(err);
        usercol.insert({"username": username, "hash": hash}, function (err, doc) {
            if (err) {
                // If it failed, return error
                return callback(err);
            }
            else {
                // And forward to success page
                console.log('new user added');
                callback();
            }
        });
        /*
        user = JSON.stringify(user);
        userCounter(function(err, nUsers) {
            if(err) return callback(err);
            var next = nUsers+1;
            if(next < 10)
                key = 'user0'+next;
            else
                key = 'user'+next;
            udb.put(key, user, callback);
        });*/
    });
}

function authenticate(username, password, callback) {

    usercol.find({"username": username},{"hash": 1}, function(e,docs){
        if (e) return callback(e);
        bcrypt.compare(password, docs[0].hash, function(err, res) {
            if (err) return callback(err);
            if (res) callback(null, docs);
            else callback(null, null);
        });
    });
    //encrypt password before authentication
/*
    var stream = udb.createReadStream().on('data', function (data) {
        var current = JSON.parse(data.value);
        if(username === current.username) {
            stream.removeListener('end', onEnd);
            bcrypt.compare(password, current.hash, function(err, res) {
                if (err) return callback(err);
                if (res) callback(null, current);
                else callback(null, null);
            });
        }
    }).on('error', function (err) {
        if (callback) {
            callback(err);
            callback = null;
        }
    }).on('end', onEnd);
    function onEnd() {
        if (callback) {
            callback(null, null);
        }
    }*/
}

module.exports.addUser = addUser;
module.exports.authenticate = authenticate;
module.exports.searchPost = searchPost;
module.exports.writePost = writePost;
module.exports.getNum = getNumPages;
module.exports.count = collectionCounter;
module.exports.getPage = getPage;