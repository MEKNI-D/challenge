/**
 * Created by Donia on 27/12/2016.
 */
var db = require('../config/db');
var city = require('../models/city');
var Temperature = db.define('temperature', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    temp:    {type: 'number'},
    date : Date,
    time : Date
}, {
    methods : {
        getTemp: function() {
            return this.temp;
        }
    }
});
Temperature.hasOne("city", city, {reverse : 'temperatures'});
Temperature.sync(function () {
});

module.exports=Temperature;