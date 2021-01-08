let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');
let utils = require('./utils');
let template = require('./templateV1');

let transferPath = [
    // { path: '/tour/harbintour/hrb-3/', code: 'hrb-3' },
    // { path: '/tour/yabulitour/ybl-2/', code: 'ybl-2' },
    // { path: '/tour/cht-sl-03/', code: 'cht-sl-03' },
    // { path: '/tour/shanghaitour/sh-26/', code: 'sh-26' },
    // { path: '/tour/shanghaitour/sh-yl-2/', code: 'sh-yl-2' },
    // { path: '/tour/shanghaitour/sh-yl-3/', code: 'sh-yl-3' },
    // { path: '/tour/hangzhoutour/hz-1/', code: 'hz-1' },
    // { path: '/tour/hangzhoutour/sh-32/', code: 'sh-32' },
    // { path: '/tour/kunmingtour/km-1/', code: 'km-1' },
    // { path: '/tour/lijiangtour/lj-3/', code: 'lj-3' },
    // { path: '/tour/hong-kongtour/hk-7/', code: 'hk-7' },
    // { path: '/tour/pingyaotour/py-1/', code: 'py-1' },
    // { path: '/tour/cht-ob-02/', code: 'cht-ob-02' },
    // { path: '/tour/huangshantour/sh-35/', code: 'sh-35' },
    // // oneday
    // { path: '/tour/xiantour/xa-6/', code: 'xa-6' },
    // { path: '/tour/xiantour/xa-10/', code: 'xa-10' },
    // { path: '/tour/hong-kongtour/hk-2/', code: 'hk-2' },
    // { path: '/tour/hong-kongtour/hk-5/', code: 'hk-5' },
    // { path: '/tour/hong-kongtour/hk-6/', code: 'hk-6' },
    // //
    // { path: '/tour/beijingtour/bj-85/', code: 'bj-85' },
    // { path: '/tour/beijingtour/bj-1b/', code: 'bj-1b' },
    // { path: '/tour/beijingtour/bj-30-gp/', code: 'bj-30-gp' },
    // { path: '/tour/beijingtour/bj-yl-1/', code: 'bj-yl-1' },
    // { path: '/tour/beijingtour/bj-yl-4/', code: 'bj-yl-4' },
    // { path: '/tour/chengdutour/cd-1a/', code: 'cd-1a' },
    // { path: '/tour/chengdutour/cd-3/', code: 'cd-3' },
    // { path: '/tour/chengdutour/cd-3a/', code: 'cd-3a' },
    // { path: '/tour/chengdutour/cd-8a/', code: 'cd-8a' },
    // { path: '/tour/chengdutour/cd-9a/', code: 'cd-9a' },
    // { path: '/tour/jiuzhaigoutour/jzg-1/', code: 'jzg-1' },
    // { path: '/tour/cht-yz-06/', code: 'cht-yz-06' },
    // { path: '/tour/chongqingtour/cq-1/', code: 'cq-1' },
    // { path: '/tour/chongqingtour/cq-2/', code: 'cq-2' },
    // { path: '/tour/chongqingtour/cq-3/', code: 'cq-3' },
    // { path: '/tour/cht-bg-01/', code: 'cht-bg-01' },
    // { path: '/tour/cht-bg-05/', code: 'cht-bg-05' },
    // { path: '/tour/cht-bg-06/', code: 'cht-bg-06' },
    // { path: '/tour/cht-kf-01/', code: 'cht-kf-01' },
    // { path: '/tour/cht-ob-02/', code: 'cht-ob-02' },
    // { path: '/tour/cht-ta-03a/', code: 'cht-ta-03a' },
    // { path: '/tour/cht-tb-15/', code: 'cht-tb-15' },
    // { path: '/tour/cht-vt-01/', code: 'cht-vt-01' },
    // { path: '/tour/cht-vt-03/', code: 'cht-vt-03' },
    // { path: '/tour/guilintour/gl-27/', code: 'gl-27' },
    // { path: '/tour/guilintour/gl-34/', code: 'gl-34' },
    // { path: '/tour/guilintour/gl-55/', code: 'gl-55' },
    // { path: '/tour/guilintour/gl-65/', code: 'gl-65' },
    // { path: '/tour/guilintour/glsic-8/', code: 'glsic-8' },
    // { path: '/tour/taiwantour/tw-01/', code: 'tw-01' },
    // { path: '/tour/taiwantour/tw-02/', code: 'tw-02' },
    // { path: '/tour/taiwantour/tw-03/', code: 'tw-03' },
    // { path: '/tour/taiwantour/tw-04/', code: 'tw-04' },
    // { path: '/tour/taiwantour/tw-05/', code: 'tw-05' },
    // { path: '/tour/taiwantour/tw-06/', code: 'tw-06' },
    // { path: '/tour/taiwantour/tw-07/', code: 'tw-07' },
    // { path: '/tour/taiwantour/tw-08/', code: 'tw-08' },
    // { path: '/tour/xiningtour/xn-2/', code: 'xn-2' },
    // //
    // { path: '/tour/lhasatour/tibet-group.htm', code: 'XZ-SP-A' }, // XZ-SP-A, XZ-SP-B, XZ-SP-D
]
let templateV = 'v1';
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
                htmlData.tourSubName = $('.day-destination').text().split(':')[1];
                // htmlData.itinerary = utils.itineraryDetail($, templateV, $('.dayTourList, .daytourBox>.dayTourList, .daytourBox>.dayTourList>.dayTourList'), null, 'tourDates', 'tourDays');
                $('h2').each(function(i, h2) {
                    if ($(h2).hasClass('includeIcon') || $(h2).parent('.tourHighlights').length>0) {
                        return true;
                    }
                    let contentObj = {
                        title: $(h2).text(),
                        anchor: $(h2).children('a').prop('outerHTML'),
                        content: '',
                    }
                    $(h2).nextUntil('h2').each(function(j, cp){
                        if ($(cp).hasClass('dayTourList')) {
                            $(cp).children().each(function(j, cp_c){
                                if ($(cp_c).prop('tagName')=='H2') {
                                    return false;
                                }
                                contentObj.content += utils.replaceElement($, cp_c, templateV);
                            });
                            return false;
                        } else if ($(cp).hasClass('daytourBox')) {
                            $(cp).children('.dayTourList').children().each(function(j, cp_c){
                                if ($(cp_c).prop('tagName')=='H2') {
                                    return false;
                                }
                                contentObj.content += utils.replaceElement($, cp_c, templateV);
                            });
                            return false;
                        }else {
                            contentObj.content += utils.replaceElement($, cp, templateV);
                        }
                    });
                    htmlData.contentData.push(contentObj);
                });
                // 有了contentData就不用这里了. 对contentData做替换处理
                // htmlData.last = utils.lastInfo_cht($);
                // todo: 行程列表层层叠叠乱来的
                $('.dayTourList, .daytourBox>.dayTourList, .daytourBox>.dayTourList>.dayTourList').each(function(i, tourlist) {
                    let tourlistTag = ($(tourlist).prop('tagName'));
                    let pHtml = `<${tourlistTag} class="__newflag">`;
                    $(tourlist).children().each(function(j, p) {
                        pHtml += utils.replaceElement($, p, templateV);
                    });
                    pHtml += `</${tourlistTag}>`;
                    // let $newTourList = cheerio.load(pHtml);// $(pHtml);
                    let $1 = cheerio.load(pHtml);// $(pHtml);
                    // let $1 = cheerio('body', pHtml);
                    let $newTourList = $1(tourlistTag);
                    // console.log(pHtml);
                    // console.log($newTourList.prop('outerHTML'));
                    // return false;
                    let tourDay = {
                        day: $newTourList.children('.tourDates').children('.tourDays').text(),
                        title: $newTourList.children('.tourDates').text(),
                        TourInfo: ''
                    }
                    // $newTourList.children('.tourDates').nextUntil('.dayTourList, h2').each(function(i, tourp) {
                    //     tourDay.TourInfo += $(tourp).prop('outerHTML');
                    // })
                    $newTourList.children().each(function(i, tourp) {
                        if ('H2' == $(tourp).prop('tagName') || !$(tourp).parent().hasClass('__newflag')) {
                            return false;
                        }
                        if (!$(tourp).hasClass('tourDates') && !$(tourp).hasClass('dayTourList') ) {
                            tourDay.TourInfo += $(tourp).prop('outerHTML');
                        }
                    })
                    $(tourlist).nextUntil('.dayTourList, .tripNotes').each(function(i, tourp) {
                        tourDay.TourInfo += $(tourp).prop('outerHTML');
                    })
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
