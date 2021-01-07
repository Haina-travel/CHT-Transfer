let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV2');

let transferPath = [
    // { path: '/tour/guilintour/gl-15/', code: 'gl-15' },
    // { path: '/tour/cht-wh-07/', code: 'cht-wh-07' },
    // { path: '/tour/cht-wh-04/', code: 'cht-wh-04' },
    // { path: '/tour/cht-pt-01/', code: 'cht-pt-01' },
    // { path: '/tour/cht-119/', code: 'cht-119' },
    // { path: '/tour/cht-75/', code: 'cht-75' },
    // { path: '/tour/cht-kf-02/', code: 'cht-kf-02' },
    // { path: '/tour/cht-seda-01/', code: 'cht-seda-01' },  // todo: Excluded
    // { path: '/tour/cht-yz-03/', code: 'cht-yz-03' },
    // { path: '/tour/cht-th-04/', code: 'cht-th-04' },
    // { path: '/tour/guangzhoutour/gz-1/', code: 'gz-1' },
    // { path: '/tour/guilintour/gl-46/', code: 'gl-46' },
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
                htmlData.last = utils.lastInfo_cht($);
                // htmlData.itinerary = utils.itineraryDetail($, templateV, $('.dayTourList, .daytourBox>.dayTourList, .daytourBox>.dayTourList>.dayTourList'), null, 'tourDates', 'tourDays');
                // todo: 行程列表层层叠叠乱来的
                $('.dayTourList, .daytourBox>.dayTourList, .daytourBox>.dayTourList>.dayTourList').each(function(i, tourlist) {
                    $(tourlist).children().each(function(j, p) {
                        if ($(p).find('img').length > 0) {
                            let imgsPHtml = '';
                            for (let index = 0; index < $(p).find('img').length; index++) {
                                const imgE = $(p).find('img').eq(index);
                                if ($(imgE).parent().hasClass('NoteTitle')) {
                                    continue;
                                }
                                if ($(imgE).parent().parent().hasClass('NoteInfo')) {
                                    let imgsHtml = `<div class="infoimage"><img alt="${$(imgE).attr('alt')}" class="img-responsive " src="${$(imgE).attr('src')}"><span class="infoimagetitle">${$(imgE).attr('alt')}</span></div>`;
                                    $(imgE).parent().replaceWith(imgsHtml);
                                } else {
                                    imgsPHtml += `<div class="infoimage"><img alt="${$(imgE).attr('alt')}" class="img-responsive " src="${$(imgE).attr('src')}"><span class="infoimagetitle">${$(imgE).attr('alt')}</span></div>`;
                                }
                            }
                            if (imgsPHtml !== '') $(p).replaceWith(imgsPHtml);
                        }
                        if ($(p).find('.fa-cutlery').length > 0) {
                            let mealHtml = `<span class="Dinner">${$(p).text()}</span>`;
                            $(p).replaceWith(mealHtml);
                        }
                    });
                    let tourDay = {
                        day: $(tourlist).children('.tourDates').children('.tourDays').text(),
                        title: $(tourlist).children('.tourDates').text(),
                        TourInfo: ''
                    }
                    $(tourlist).children('.tourDates').nextUntil('.dayTourList').each(function(i, tourp){
                        tourDay.TourInfo += $(tourp).prop('outerHTML');
                    })
                    // $(tourlist).remove('.dayTourList');
                    // $(tourlist).remove('.tourDates');
                    // tourDay.TourInfo = $(tourlist).html();
                    tourDay.title = tourDay.title.replace(tourDay.day, '');
                    htmlData.itinerary.push(tourDay);
                });

                resolve(htmlData);
            }).on('error', function(e) {
                reject(e)
            });;
        })
    });
    return pm;
}


