let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV3');

let transferPath = [
    // { path: '/tour/suzhoutour/sh-33/', code: 'sh-33' },
    // { path: '/tour/lhasatour/xz-4/', code: 'xz-4' },
    // { path: '/tour/huangshantour/hs-1/', code: 'hs-1' },
    // { path: '/tour/xiamentour/xm-7/', code: 'xm-7' },
    { path: '/tour/cht-ft-01/', code: 'cht-ft-01' },
]
let templateV = 'v3';
transferPath.forEach(function(ele, i) {
    loadPage(ele).then(function(htmlJSON) {
        utils.writeFile(templateV, template(htmlJSON), ele.path);
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
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('.daytourBox .dayTourList'), 'ItineraryContent', 'tourDatesBJ', 'tourDays');
                htmlData.last = utils.lastInfo_cht($);

                if (htmlData.itinerary.length === 0) {
                    htmlData.itinerary = utils.itineraryDetail($, templateV, $('.daytourBox>.ItineraryContent'), null, 'tourDatesBJ', 'tourDays');
                }

                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}
