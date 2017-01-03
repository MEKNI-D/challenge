var express = require('express');
var router = express.Router();
var cron = require('cron');
var request = require('request');
var cityCtrl = require('../controllers/cityCtrl');

var cronJob = cron.job('0 */60 * * * *', function() {
    console.log('Runs every 60 minutes ' + new Date());
    request.post(
        'http://localhost:3000/city/storeTemperatures',
        { json: null },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
});
cronJob.start();

router.post('/storeTemperatures', cityCtrl.storeTemperatures);


router.get('/cities/max_temperatures', cityCtrl.getHighestTemperatures);
router.get('/:city_name', cityCtrl.getCityTemperatureByName);

router.post('/:city_name', cityCtrl.addCityByName);
router.post('/by_cep/:cep', cityCtrl.addCityByCep);
router.delete('/:city_name', cityCtrl.removeCity);
router.patch('/:city_name', cityCtrl.clearTemperatureHistory);

module.exports = router;


