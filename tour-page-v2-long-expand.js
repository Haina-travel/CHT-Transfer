let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV2');

let transferPath = [
    // { path: '/tour/cht-pt-02/', code: 'cht-pt-02' },
    // { path: '/tour/xiamentour/xm-7/', code: 'xm-7' },
]
let templateV = 'v2';
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
                // port: 80,
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
                htmlData.tourSubName = $('.topSubTitle').text();
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('.daytourBox>.dayTourList, .daytourBox>.dayTourList>.dayTourList'), 'ItineraryContent', 'tourDatesBJ', 'tourDays');
                htmlData.last = utils.lastInfo_cht($);

                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}
