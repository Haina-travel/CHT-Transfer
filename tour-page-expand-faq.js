let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV3');

let transferPath = [
    { path: '/tour/zhangjiajietour/hun-3/', code: 'hun-3' },
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
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('.daytourBox>.ItineraryContent'), null, 'tourDatesBJ', 'tourDays');
                htmlData.faq = utils.faqDetail($, $('.topFaq .ItineraryContent'), templateV);
                htmlData.last = utils.lastInfo_cht($);
                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}
