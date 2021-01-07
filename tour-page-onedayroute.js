
let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV3');

let transferPath = [
    // {path: '/tour/chengdutour/cd-7/', code: 'cd-7'},
    // {path: '/tour/chengdutour/cd-7a/', code: 'cd-7a'},
    // {path: '/tour/xiamentour/1-day-nanjing-tulou-tour/', code: 'XM-2'},
    {path: '/tour/zhangjiajietour/hun-4a/', code: 'hun-4a'},
]
let templateV = 'v3';
transferPath.forEach(function(ele, i) {
    loadPage(ele).then(function(htmlJSON) {
        utils.writeFile(templateV,template(htmlJSON), ele.path);
    });
})

function loadPage(ele) {
    let pm = new Promise(function (resolve, reject) {
        let options = {
            host: 'www.chinahighlights.com',
            path: ele.path
            // port: 80,
        };
        let html = '';
        http.get(options, function (res) {
            res.on('data', function (data) {
                // collect the data chunks to the variable named "html"
                html += data;
            }).on('end', function () {
                let $ = cheerio.load(html);
                $ = utils.docOptimize($);
                let htmlData = utils.htmlData($, ele);
                htmlData.itinerary = utils.itineraryDetail($, templateV, $('.onedayroute .onedayinfo'), null, 'onedaytitle', null);
                // todo: lastInfo
                let lastInfo = [];
                ($('.onedayroute').nextAll().each(function (i, el) {
                    lastInfo.push($(el).prop('outerHTML'));
                }))
                htmlData.last = lastInfo.join('');
                resolve(htmlData);
            }).on('error', function (e) {
                reject(e)
            });;
        })
    });
    return pm;
}
