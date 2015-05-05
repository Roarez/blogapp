var level = require('level');
var bcrypt = require('bcrypt');
var db = level('/tmp/blogdb');
var udb = level('/tmp/blogusersdb',{createIfMissing: true});

function entryCounter(callback) {
    var entries = 0;
    db.createReadStream().on('data', function (data) {
        entries++;
    }).on('error', function (err) {
        if (callback) {
            callback(err);
            callback = null;
        }
    }).on('end', function () {
        if (callback) {
            callback(null, entries);
            callback = null;
        }
    });
}

function userCounter(callback) {
    var users = 0;
    udb.createReadStream().on('data', function (data) {
        users++;
    }).on('error', function (err) {
        if (callback) {
            callback(err);
            callback = null;
        }
    }).on('end', function () {
        if (callback) {
            callback(null, users);
            callback = null;
        }
    });
}

function getNumPages(nEntries, perPage) {
    var ratio = nEntries%perPage;
    var nPages = ratio === 0 ? nEntries/perPage : ((nEntries-ratio)/perPage)+1;
    return nPages;
}

function getPage(nPage, perPage, cb) {
    var startKey = (nPage * perPage)-(perPage-1) //(1*2)-(2-1) = 2-(1) = 2-1 = 1
    var endKey = nPage * perPage;
    
    startKey = 'post' + (startKey < 10 ? '0' : '') + startKey;
    endKey = 'post' + (endKey < 10 ? '0' : '') + endKey;
    var posts = [];

    db.createReadStream({start: startKey, end: endKey})
    .on('data', function (data) {
        posts.push(JSON.parse(data.value));
    })
    .on('error', function (err) {
        cb(err);
    })
    .on('end', function () {
        cb(null, posts);
    });
}

function writePost(title, author, text, callback) {
    var post = {author: author, title: title, date: Date.now(), text: text};
    post = JSON.stringify(post);
    var key;
    entryCounter(function(err, nEntries) {
        if(err) return callback(err);
        var next = nEntries+1;
        if(next < 10)
            key = 'post0'+next;
        else
            key = 'post'+next;
        db.put(key, post, callback);
    });
}

function searchPost(crit, value, endDate, callback) {
    if (typeof endDate === 'function' && !callback) {
        callback = endDate;
        endDate === null;
    }
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
    });
}

function addUser(username, password, callback) {
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) return callback(err);
        var user = {username: username, hash: hash};
        user = JSON.stringify(user);
        userCounter(function(err, nUsers) {
            if(err) return callback(err);
            var next = nUsers+1;
            if(next < 10)
                key = 'user0'+next;
            else
                key = 'user'+next;
            udb.put(key, user, callback);
        });
    });
    // encrypt password here

    
}

function authenticate(username, password, callback) {

    
    //encrypt password before authentication

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
    }
}

module.exports.addUser = addUser;
module.exports.authenticate = authenticate;
module.exports.searchPost = searchPost;
module.exports.writePost = writePost;
module.exports.getNum = getNumPages;
module.exports.count = entryCounter;
module.exports.getPage = getPage;