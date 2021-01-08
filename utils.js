let fs = require('fs');
var path = require('path');

const writeFile = (version, htmlStr, target_file_name = 'tmp') => {
    target_file_name = target_file_name.replace(/^\/?|\/?$/g, '').replace(/\/+/g, '.') + '.html';
    fs.writeFileSync(path.join(version, target_file_name), htmlStr, function(err) {
        if (err) {
            console.log("write " + err.message)
            return
        }
    });
}
const docOptimize = ($) => {
    $('body').find('ul').each(function(i, ul) {
        // $(ul).attr('class','');
        $(ul).addClass('infolist');
    });
    $('body').find('ol').each(function(i, ol) {
        $(ol).replaceWith('<ul class="infolist">' + $(ol).html() + '</ul>')
    });
    $('.earlyBird .freeUpgrade').remove('.InquiryButton');
    $('#expandAll, .clear, .clearfix, #booking_form_button, #form_booking_form_paynow_button, .InquiryButton').remove();
    return $;
}
const htmlData = ($, pathEle) => {
    let jsonData = {
        tourCode: pathEle.code,
        url: pathEle.path,
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        topImg: $('.TopCht1 img.visible-xs').length > 0 ? $('.TopCht1 img.visible-xs').attr('src') : $('.TopCht1 img, #photoTop img').eq(0).attr('src'),
        topImgAlt: $('.TopCht1 img.visible-xs').length > 0 ? $('.TopCht1 img.visible-xs').attr('alt') : $('.TopCht1 img, #photoTop img').eq(0).attr('alt'),
        tourSubName: $('.topheadline').text(),
        tourName: $('h1').text(),
        overview: '',
        highlights: '',
        TAinfo: '',
        last: '',
        promote: '',
        itineraryP: '',
        contentData: [],
        itinerary: [],
        itineraryDays: [],
        faq: [],
        onedayroute: $('.onedayroute').parent().html(),
        serviceIncludes: '',
        priceIncludes: '',
    };
    jsonData.overview = parseOverview($);
    jsonData.TAinfo = parseTA($);
    jsonData.itineraryDays = itinerarySummary($);
    jsonData.itineraryP = itineraryOverview($);
    jsonData.priceIncludes = topPrice($);
    jsonData.highlights = tourHighlights($);
    jsonData.serviceIncludes = serviceIncludesH($);
    return jsonData;
}
const parseOverview = ($) => {
    let overviewHtml = '';
    if ($('#contentHead').next().length > 0) {
        for (let index = 0; index < $('#contentHead').nextAll().length; index++) {
            const nextE = $('#contentHead').nextAll().eq(index);
            overviewHtml += $(nextE).prop('outerHTML');
        }
    } else if ($('.tourHighlights').eq(0).prevAll().length > 0) {
        for (let index = 0; index < $('.tourHighlights').eq(0).prevAll().length; index++) {
            const nextE = $('.tourHighlights').eq(0).prevAll().eq(index);
            overviewHtml = $(nextE).prop('outerHTML') + overviewHtml;
        }
    }
    return overviewHtml;
}
const serviceIncludesH = ($) => {
    let serviceIncludesHtml = '';
    serviceIncludesHtml += $('.priceIncludes ul').length > 0 ? $('.priceIncludes ul').prop('outerHTML') : '';
    serviceIncludesHtml += $('ul.whatIncluded').length > 0 ? $('ul.whatIncluded').prop('outerHTML') : '';

    $('ul.whatIncluded').nextUntil('h2').each(function(i, tourp) {
        serviceIncludesHtml += $(tourp).prop('outerHTML');
    })
    return serviceIncludesHtml;
};
const topPrice = ($) => {
    let priceHtml = '';
    let $priceDiv = $('.TourPrice').length > 0 ? $('.TourPrice') :
        ($('.priceIncludes').length > 0 ? $('.priceIncludes') :
            $('.TopPrice'));
    if ($priceDiv.length > 0) {
        priceHtml = `<div class="TopItinerary">
        <div class="TMcontent"><span class="TMtitle">Tailor Make Your Tour:</span>
        <ul class="infolist">
            <li>Your Schedule</li>
            <li>Your Interests</li>
            <li>Your Hotel Tastes</li>
        </ul>
        </div>
        <div class=" DetailTopTM">
        <div class="TopPrice">
        ${$priceDiv.prop('outerHTML')}
        </div>
        </div>
        </div>`;
    }
    return priceHtml;
};
const tourHighlights = ($) => {
    let highlightsHtml = '<ul class="infolist">';
    if ($('.TourHighlights').length > 0) {
        highlightsHtml += $('.TourHighlights').eq(0).children('ul').html();
    }
    // todo: .tourHighlights>ul
    if ($('.tourHighlights ul,.tourHighlights>ul').length > 0) {
        highlightsHtml += $('.tourHighlights ul, .tourHighlights>ul').eq(0).html();
    }
    if ($('.highlights ul').length > 0) {
        highlightsHtml += $('.highlights ul').html();
    }
    if ($('ul.tourHighlights').length > 0) {
        highlightsHtml += $('ul.tourHighlights').html();
    }
    // 圆图, 删除图片, 只要文字
    if ($('.highlightscontent').children().length > 0) {
        $('.highlightscontent').children().each(function(i, h) {
            highlightsHtml += `<li>${$(h).text()}</li>`
        });
    }
    highlightsHtml += '</ul>';
    return highlightsHtml;
};
const parseTA = ($) => {
    let TA = '';
    if ($('.reviewDetail').length > 0) {
        let taP = $('.reviewDetail').text();
        let taFrom = $('.reviewDetail .byWho').text();
        tap = taP.replace(taFrom, '');
        let taLink = $('.reviewNumber a').attr('href');
        TA = `<div class="reviews">
        <p>${taP}<a href="${taLink}" target="_top">Read more</a></p>
        <p class="reviewname">${taFrom}</p>
        </div>`;
    }
    if ($('.reviewdetail').length > 0) {
        let taP = $('.reviewdetail').text();
        let taFrom = $('.reviewdetail .bywho').text();
        tap = taP.replace(taFrom, '');
        let taLink = $('.reviewNumber a').attr('href');
        TA = `<div class="reviews">
        <p>${taP}<a href="${taLink}" target="_top">Read more</a></p>
        <p class="reviewname">${taFrom}</p>
        </div>`;
    }
    if ($('.feedbackBlock').length > 0) {
        let taP = $('.feedbackBlock .feedbackDetail').text();
        let taFrom = $('.feedbackBlock .bywho').text();
        tap = taP.replace(taFrom, '');
        TA = `<div class="reviews">
        <p>${taP}</p>
        <p class="reviewname">${taFrom}</p>
        </div>`;
    }
    return TA;
};
const itinerarySummary = ($) => {
    let tmpSummary = [];
    // $('.TourItinerary').next('div').find('.TourDays').each(function(i, d) {
    $('.CityTransport').siblings('.TourDays').each(function(i, d) {
        let tmpD = {
            day: $(d).children('b').text(),
            dayTour: []
        };
        $(d).children('ul.TourSees').children().each(function(j, dt) {
            tmpD.dayTour.push($(dt).text())
        })
        tmpSummary.push(tmpD);
    });
    return tmpSummary;
};
const itineraryOverview = ($) => {
    let p = '';
    $('#itineraryDetails>p').each(function(i, pe) {
        p += $(pe).prop('outerHTML');
    });
    return p;
};
const lastInfo_cht = ($) => {
    let info = '';
    info += $('.tripNotes').length > 0 ? $('.tripNotes').html() : '';
    $('.TopDetail').next('.container').children('.row').children('div[class^="col-"],h2[class^="col-"]').each(function(i, p) {
        if ($(p).prop('tagName').toLowerCase() === 'div') {
            info += $(p).html();
            return true;
        }
        $(p).attr('class', '');
        info += $(p).prop('outerHTML');
    })
    $('#footer').prev('.container').children('.row').children('div[class^="col-"],h2[class^="col-"]').each(function(i, p) {
        if ($(p).prop('tagName').toLowerCase() === 'div') {
            info += $(p).html();
            return true;
        }
        $(p).attr('class', '');
        info += $(p).prop('outerHTML');
    })
    return info;
};
const lastInfo_in_itinerary = ($, $itineraryBox, listClass) => {
    let lastInfo = [];
    let lastInfoHtml = '';
    $itineraryBox.children().each(function(i, el) {
        if (!$(el).hasClass(listClass)) lastInfo.push($(el).prop('outerHTML'));
    });
    lastInfoHtml += lastInfo.join('');
    lastInfoHtml += $('.tripNotes').length > 0 ? $('.tripNotes').html() : '';
    return lastInfoHtml;
};
const itineraryImg = (imgSrc, imgTitle, templateV) => {
    let imgsHtml = '';
    let imgTitleHtml = '';
    switch (templateV) {
        case 'v3':
            imgTitleHtml = imgTitle !== '' ? `<span class="imgname">${imgTitle}</span>` : '';
            imgsHtml = `<div class="tourimg"><img alt="${imgTitle}" class="TopImage img-responsive" src="${imgSrc}"> ${imgTitleHtml}</div>`;
            break;
        case 'v2':
            imgTitleHtml = imgTitle !== '' ? `<span class="infoimagetitle">${imgTitle}</span>` : '';
            imgsHtml = `<div class="infoimage"><img alt="${imgTitle}" class="img-responsive " src="${imgSrc}"></div>`;
            break;
        default:
            // v2
            imgTitleHtml = imgTitle !== '' ? `<span class="infoimagetitle">${imgTitle}</span>` : '';
            imgsHtml = `<div class="infoimage"><img alt="${imgTitle}" class="img-responsive " src="${imgSrc}"></div>`;
            break;
    }
    return imgsHtml;
};
const replaceElement = ($, p, templateV) => {
    if ($(p).find('img').length > 0) {
        let imgsPHtml = '';
        for (let index = 0; index < $(p).find('img').length; index++) {
            const imgE = $(p).find('img').eq(index);
            if ($(imgE).parent().hasClass('NoteTitle')) {
                continue;
            }
            if ($(imgE).parent().parent().hasClass('NoteInfo')) {
                let imgsHtml = itineraryImg($(imgE).attr('src'), $(imgE).attr('alt'), templateV);
                $(imgE).parent().replaceWith(imgsHtml);
            } else {
                let alt = $(imgE).attr('alt');
                alt = alt ? alt : $(imgE).parent().next('.TourImgTitle, .photoBy').text();
                $(imgE).parent().next('.TourImgTitle, .photoBy').remove();
                imgsPHtml += itineraryImg($(imgE).attr('src'), alt, templateV);
            }
        }
        if (imgsPHtml !== '') return imgsPHtml;
    }
    if ($(p).find('.fa-cutlery').length > 0) {
        let mealHtml = `<span class="Dinner">${$(p).text()}</span>`;
        return mealHtml;
    }
    return $(p).prop('outerHTML');
};
/**
 * 读取行程列表
 * @param {*} $
 * @param {*} templateV
 * @param {*} $tourBox
 * @param {*} dayChildrenSelector dayBox下的详情的css选择器, 没有dayBox则为null
 * @param {*} titleClass
 * @param {*} dayClass
 * @return {Array} itinerary = [{day:'', title: '', TourInfo: ''}]
 */
const itineraryDetail = ($, templateV, $tourBox, dayChildrenSelector, titleClass, dayClass) => {
    let itineraryData = [];
    $tourBox.each(function(i, tourlist) {
        let detailSelector = dayChildrenSelector !== null ? $(tourlist).children(dayChildrenSelector) : $(tourlist);
        let titleSelector = dayChildrenSelector !== null ? $(tourlist).children('.' + titleClass) : $(tourlist).prev('.' + titleClass);
        let daySelector = titleSelector.children('.' + dayClass);
        let detailHtml = '';
        detailSelector.children().each(function(j, p) {
            detailHtml += replaceElement($, p, templateV);
        });
        let tourDay = {
            day: daySelector.text(),
            title: titleSelector.text(),
            TourInfo: detailHtml //detailSelector.html()
        }
        tourDay.title = tourDay.title.replace(tourDay.day, '');
        // 一日游×2
        if (titleClass === null) {
            tourDay = {
                day: titleSelector.text(),
                title: '',
                TourInfo: detailHtml //detailSelector.html()
            }
            if (dayClass === null) {
                tourDay = {
                    day: $(tourlist).children('h2').text().split('—')[0],
                    title: $(tourlist).children('h2').text().split('—')[1],
                    TourInfo: ''
                }
                $(tourlist).children('h2').nextAll().each(function(i, tourp) {
                    tourDay.TourInfo += $(tourp).prop('outerHTML');
                })
            }
        }
        itineraryData.push(tourDay);
    });
    return itineraryData;
};
/**
 * @deprecated
 * @param {*} $
 * @param {*} $tourBox
 * @param {*} templateV
 */
const itineraryDetail_without_daybox = ($, $tourBox, templateV) => {
    let itineraryData = [];
    $tourBox.each(function(i, tourlist) {
        $(tourlist).children().each(function(j, p) {
            if ($(p).find('img').length > 0) {
                let imgsPHtml = '';
                for (let index = 0; index < $(p).find('img').length; index++) {
                    const imgE = $(p).find('img').eq(index);
                    if ($(imgE).parent().hasClass('NoteTitle')) {
                        continue;
                    }
                    if ($(imgE).parent().parent().hasClass('NoteInfo')) {
                        let imgsHtml = itineraryImg($(imgE).attr('src'), $(imgE).attr('alt'), templateV);
                        $(imgE).parent().replaceWith(imgsHtml);
                    } else {
                        imgsPHtml += itineraryImg($(imgE).attr('src'), $(imgE).attr('alt'), templateV);
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
            day: $(tourlist).prev('.tourDatesBJ').children('.tourDays').text(),
            title: $(tourlist).prev('.tourDatesBJ').text(),
            TourInfo: $(tourlist).html()
        }
        tourDay.title = tourDay.title.replace(tourDay.day, '');
        itineraryData.push(tourDay);
    });
    return itineraryData;
};
const faqDetail = ($, $faqBox, templateV) => {
    let faq = [];
    $faqBox.each(function(i, tourlist) {
        $(tourlist).children().each(function(j, p) {
            if ($(p).find('img').length > 0) {
                let imgsPHtml = '';
                for (let index = 0; index < $(p).find('img').length; index++) {
                    const imgE = $(p).find('img').eq(index);
                    if ($(imgE).parent().hasClass('NoteTitle')) {
                        continue;
                    }
                    if ($(imgE).parent().parent().hasClass('NoteInfo')) {
                        let imgsHtml = itineraryImg($(imgE).attr('src'), $(imgE).attr('alt'), templateV);
                        $(imgE).parent().replaceWith(imgsHtml);
                    } else {
                        imgsPHtml += itineraryImg($(imgE).attr('src'), $(imgE).attr('alt'), templateV);
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
            title: $(tourlist).prev('.tourDatesBJ').text(),
            TourInfo: $(tourlist).html()
        }
        faq.push(tourDay);
    });
    return faq;
};
module.exports = {
    writeFile,
    docOptimize,
    htmlData,
    topPrice,
    tourHighlights,
    parseOverview,
    parseTA,
    itinerarySummary,
    itineraryOverview,
    replaceElement,
    itineraryImg,
    itineraryDetail,
    itineraryDetail_without_daybox,
    lastInfo_cht,
    lastInfo_in_itinerary,
    faqDetail
};
