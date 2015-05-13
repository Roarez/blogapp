var mongo = require('mongodb');
var monk = require('monk');
var bcrypt = require('bcrypt');
var db = monk('localhost:27017/blogapp');
var postcol = db.get("posts");
var usercol = db.get("users");
var moment = require('moment');

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
                    var temp = doc;
                    temp.date = moment(doc.date).format('YYYY-MM-DD');
                    pagePosts.push(temp);
                    count++;
                }
            }
            skip++;
        });
        cb(null, pagePosts);
    });

}

function writePost(title, author, text, callback) {
    postcol.insert({"author": author, "title": title, "date": Date.now(), "text": text},
        function (err, doc) {
            if (err) {
                return callback(err);
            }
            else {
                console.log('success');
                callback();
            }
    });

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
        var time = Number(moment(value).format('x'));
        var endTime = Number(moment(endDate).format('x'));
        console.log('time:',time,'value:',value);
        console.log('endTime:',endTime,'endDate:',endDate);
        if(endDate === undefined) {
            postcol.find( {"date": { $gte: time } }, function(e,docs) {
                if (e) return callback(e);
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
}

function addUser(username, password, callback) {
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) return callback(err);
        usercol.insert({"username": username, "hash": hash}, function (err, doc) {
            if (err) {
                return callback(err);
            }
            else {
                console.log('new user added');
                callback();
            }
        });
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
}

module.exports.addUser = addUser;
module.exports.authenticate = authenticate;
module.exports.searchPost = searchPost;
module.exports.writePost = writePost;
module.exports.getNum = getNumPages;
module.exports.count = collectionCounter;
module.exports.getPage = getPage;