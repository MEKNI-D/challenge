/**
 * Created by Donia on 28/12/2016.
 */
var request = require('request');
var async = require('async');
var City = require('../models/city');
var Temp = require('../models/temperature');

// ** GET cities temperatures
module.exports.getHighestTemperatures = function (req, res) {
    var finalResult = [];

    Temp.find({ }).each().filter(function (temp) {
        return temp;
    }).sort(function (temp1, temp2) {
        return temp2.temp - temp1.temp;
    }).get(function (temps) {

        var i = 0;
        temps.forEach(function (temp) {
            temp.getCity(function (err, city) {
                i+=1;
                if(i == temps.length ){
                    console.log(finalResult);
                    res.send(finalResult.slice(0, 3));
                    process.exit();
               }else {
                    console.log(temps.length);
                    finalResult.push({city : city.name, temp : temp.temp});
                }

            });
        });
    });

}

// ** GET cities temperatures
module.exports.storeTemperatures = function (req, res) {

    async.waterfall([
        //First Callback get the cities
        function(callback){
            City.find({}, function (err, cities) {
                if(err){res.status(500).json(err);}
                else{
                    console.log(cities);
                    callback(null, cities, 'two');


                }
            })

        }
        //Second callback store temperature for each city
        , function (cities, arg2, callback) {

            console.log(cities.length)
            cities.forEach(function (city) {
                //console.log("iteration n " + i)
               /* var city_id=cities[i].id;
                console.log(city_id)*/

                var myCallback = function(error, response, body) {
                    console.log('I am myCallback');
                    console.log('I am the for statement')
                    if (!error && response.statusCode == 200 && JSON.parse(body).results.temp != '') {

                        console.log('I am if statement')
                        console.log(city.id)

                        var result = JSON.parse(body);


                        var fromDate = result.results.date;
                        var numbers = fromDate.match(/\d+/g);
                        console.log(numbers)
                        var resDate = numbers[2].concat('-').concat(numbers[1]).concat('-').concat(numbers[0]);

                        var fromTime = result.results.time;
                        var numbersTime = fromTime.match(/\d+/g);
                        var time = new Date(numbers[2],numbers[1]-1,numbers[0], numbersTime[1], numbersTime[0],00);

                        Temp.create({
                            temp : result.results.temp,
                            date : new Date(resDate),
                            time : time,
                            city_id : city.id
                        }, function (err, temp) {
                            if (err){console.log(err);res.status(500).json(err);}
                            else{
                                console.log('i did it')
                                console.log(temp);
                                //res.status(200).json(temp)

                            }
                        });
                    }
                    else {
                        console.log('there was something wrong with the city id no '+city.id+' weather data available for this one');
                    }

                };
                var pattern=/^[a-zA-Z0-9- ]*$/;
                request('https://api.hgbrasil.com/weather/?format=json&city_name='+encodeURIComponent(city.name)+'&key=b69e547d',myCallback);
            });
            callback(null, 'done');

        }
        // Last callback test everything done
    ], function (err, result) {
        console.log(result)
        res.status(200).json(result);
    });
}
// ** GET city temperature by city_name
module.exports.getCityTemperatureByName = function (req, res) {

    City.find({name : req.params.city_name}, function (err, cities) {
        var id = cities[0].id;
        console.log(id)
        City.get(id, function (err, city) {
            city.getTemperatures(function (err, temps) {
                var result = [];
                var finalResult = {};
                if(temps.length>0){
                    temps.forEach(function (temp) {
                        if (parseInt((new Date()-temp.time)/1000)<= 108000){
                            result.push(temp);
                        }
                    });

                    finalResult.city = req.params.city_name;
                    finalResult.temperatures = result;

                    res.json(finalResult);
                }else{
                    finalResult.message = 'There is no temperature history available for this ciyty'
                    res.json(finalResult);}


            });

        })

    })
}

// ** POST new city by cid
module.exports.addCityByName = function (req, res) {

    City.find({ name: req.params.city_name }, "name", function (err, city) {
        if(city.length>0){
            console.log(city)
            res.status(500).send('This city already exists');
        }else {
            City.create({
                name : req.params.city_name.replace(/\s/g,'')

            }, function (err, response) {
                if (err) {console.error(err);res.status(500).send(err);}
                else{res.status(200).json(response);}
            })
        }
    });

}

// ** POST new city by cid
module.exports.addCityByCep = function (req, res) {
    var city = {};
    request('https://viacep.com.br/ws/'+req.params.cep+'/json/', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            city = JSON.parse(body);

            City.find({ name: city.localidade }, "name", function (err, result) {
                if(result.length>0){
                    console.log(err);
                    res.status(500).send('This city already exists');
                }else {
                    City.create({
                        name : city.localidade.replace(/\s/g,''),
                        cep : city.cep

                    }, function (err, response) {
                        if (err) {console.error(err);res.status(500).send(err);}
                        else{res.status(200).json(response);}
                    });

                }
            });

        }
    });

}

// ** DELETE remove city from monitoring
module.exports.removeCity = function (req, res) {

    City.find({name : req.params.city_name}, function (err, city) {
        var id = city[0].id;
        City.get(id, function (err, city) {
            city.getTemperatures(function (err, temps) {
                temps.forEach(function (temp) {
                    console.log(temp.temp);
                    temp.remove(function (err) {
                        console.log('done removing city temperatures');
                    });
                });
            });
            city.remove(function (err) {
                console.log("removed!");
                res.send('dooone removing city');
            });
        })
    });
}

// ** PATCH clear city temperature history
module.exports.clearTemperatureHistory = function (req, res) {
    City.find({name : req.params.city_name}, function (err, city) {
        if(city.length == 0){res.status(500).json('no such city found ');}
        else{
        var id = city[0].id;
        console.log(city[0].name);
        City.get(id, function (err, city) {
            city.getTemperatures(function (err, temps) {
                temps.forEach(function (temp) {
                    console.log(temp.temp);
                    temp.remove(function (err) {
                        console.log('done clearing city temperature history');

                    })
                })
                res.send('done clearing city temperature history');
            });

        })}
    });

}