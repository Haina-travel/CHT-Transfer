let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV3');

let transferPath = [
    { path: '/tour/cht-63/', code: 'cht-63' },
    // { path: '/tour/china-summer-vacations.htm', code: 'Summer-1' },
]
let templateV = 'v3';
transferPath.forEach(function(ele, i) {
    loadPage(ele).then(function(htmlJSON) {
        utils.writeFile(templateV,template(htmlJSON), ele.path);
    });
})

function loadPage(ele) {
    let pm = new Promise(function(resolve, reject) {
        let options = {
            host: 'www.chinahighlights.com',
            path: ele.path
        };
        let html = '';
        http.get(options, function(res) {
            res.on('data', function(data) {
                // collect the data chunks to the variable named "html"
                html += data;
            }).on('end', function() {
                let $ = cheerio.load(html);
                $ = utils.docOptimize($);
                let htmlData = utils.htmlData($, ele);
                htmlData.tourSubName = $('.Top10').text();
                htmlData.tourName = $('.TourItinerary').text();
                htmlData.promote = $('.earlyBird .freeUpgrade').prop('outerHTML');
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('#itineraryDetails .TourList'), 'TourInfo', 'TourDates', 'TourDay');
                htmlData.last = utils.lastInfo_cht($);

                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}


