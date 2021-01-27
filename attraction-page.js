let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./attraction');

let transferPath = [
    {path: '/alshan/attraction/'},
    {path: '/baotou/attraction/'},
    // {path: '/hohhot/attraction/'}, // template
    { path: '/changchun/attraction/' },
    {path: '/shenyang/attraction/'},
    {path: '/dalian/attraction/'},
    {path: '/fenghuang/attraction/'},
    {path: '/chongqing/attraction/'},
    {path: '/shenzhen/attraction/'},
    {path: '/zhaoqing/attraction/'},
    // {path: '/zhuhai/attraction/'},
    {path: '/foshan/attraction/'},
    {path: '/dongguan/attraction/'},
    {path: '/guangzhou/attraction/'},
    {path: '/wuhan/attraction/'},
    {path: '/jingzhou/attraction/'},
    {path: '/yichang/attraction/'},
    // {path: '/yangtzeriver/attraction/'},
    {path: '/taiwan/attraction/'},
    {path: '/tianjin/attraction/'},
    {path: '/yanan/attraction/'},
    // {path: '/zhaoxing/attraction/'}, // 不存在
]
let templateV = 'attraction';
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
                // htmlData.tourSubName = $('.Top10').text();
                // htmlData.tourName = $('.TourItinerary').text();
                // htmlData.itinerary = utils.itineraryDetail($, templateV, $('.touritinerary .TourList'), '.TourInfo', 'TourDates', 'TourDay');
                // htmlData.last = utils.lastInfo_in_itinerary($, $('.touritinerary .TourList').parent(), 'TourList');
                // if ($('#mainContentRight').length>0) {
                $('#mainContentRight').children().each(function(i, p) {
                    if ($(p).hasClass('customerReview') || $(p).hasClass('hidden-xs')
                        || $(p).prop('tagName')=='SCRIPT'
                    ) {
                        return true;
                    }
                    if ($(p).prop('tagName')==='P') {
                        htmlData.last += $(p).prop('outerHTML');
                        return true;
                    }
                    // if ($(p).prop('id') == 'cityAttraction') {
                        $(p).find('.attractionList').each(function(i, card) {
                            let originalSrc = $(card).find('img').eq(0).attr('data-original');
                            originalSrc = originalSrc ? originalSrc : $(card).find('img').eq(0).attr('src');
                            originalSrc = originalSrc.replace(/images\.+/gmi, 'images.');
                            $(card).find('img').eq(0).attr('src', originalSrc);
                            $(card).find('img').eq(0).removeClass('lazy');
                            $(card).find('img').eq(0).removeAttr('data-original');
                            $(card).find('img').eq(0).addClass('img-responsive');
                            let cardContent = $(card).html();
                            cardContent.replace(``)
                            htmlData.contentData.push($(card).html());
                        })
                    // }
                });
                // }
                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}
