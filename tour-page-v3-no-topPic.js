let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV3');

let transferPath = [
    // { path: '/guilin-tours/3-days-classic-guilin-yangshuo-tour.htm', code: 'gl-1' },
    { path: '/guilin-tours/4-days-guilin-longji-yangshuo-tour.htm', code: 'gl-4' },
    // { path: '/guilin-tours/6-days-guilin-tour.htm', code: 'gl-7' },
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
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('.itineraryDetail>.dayItinerary'), null, null, null);
                htmlData.last = utils.lastInfo_in_itinerary($, $('.itineraryDetail'), 'dayItinerary');

                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}
