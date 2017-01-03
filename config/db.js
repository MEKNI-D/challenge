/**
 * Created by Donia on 27/12/2016.
 */
var mysql = require('mysql');
var orm = require('orm');
    var db =orm.connect('mysql://root@localhost/challenge', function(err, bd) {
    if (err) return console.error('Connection error: ' + err);
    console.log('you are now connected to challenge database');
});

module.exports = db;