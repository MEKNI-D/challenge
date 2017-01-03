/**
 * Created by Donia on 27/12/2016.
 */
var db = require('../config/db');
//var orm = require('orm');
//var db =orm.connect('mysql://root@localhost/challenge');
var City = db.define('city', {
    id:      {type: 'serial', key: true}, // the auto-incrementing primary key
    name:    {type: 'text'},
    cep: {type: 'text'}
}, {
    methods : {
        getCityName: function() {
            return this.name;
        },
        getCityCep : function () {
            return this.name + ' ' + this.cep;
        }
    }
});

City.sync(function () {
    
});

module.exports=City;
