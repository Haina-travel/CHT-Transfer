
let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');

let transferPath = [
    // { path: '/tour/xiamentour/xm-1/', code: 'xm-1' },
    // { path: '/tour/lijiangtour/lj-1/', code: 'lj-1' },
]
transferPath.forEach(function (ele, i) {
    loadPage(ele.path, ele.code).then(function (htmlJSON) {
        writeFile(tourTemplate(htmlJSON), ele.path);
    });
})

function loadPage(path, code="") {
    let pm = new Promise(function (resolve, reject) {
        let options = {
            host: 'www.chinahighlights.com',
            path: path
            // port: 80,
        };
        let html = '';
        http.get(options, function (res) {
            res.on('data', function (data) {
                // collect the data chunks to the variable named "html"
                html += data;
            }).on('end', function () {
                let $ = cheerio.load(html);
                let htmlData = {
                    tourCode: code,
                    url: path,
                    description: $('meta[name="description"]').attr('content'),
                    keywords: $('meta[name="keywords"]').attr('content'),
                    topImg: $('.TopCht1 img.visible-xs') ? $('.TopCht1 img.visible-xs').attr('src') : $('.TopCht1 img').eq(0).attr('src'),
                    topImgAlt:  $('.TopCht1 img.visible-xs') ? $('.TopCht1 img.visible-xs').attr('alt') : $('.TopCht1 img.visible-xs').attr('alt'),
                    tourSubName: $('.topheadline').text(),
                    tourName: $('#contentHead h1').text(),
                    overview: $('#contentHead').next().html(),
                    highlights: $('.highlights ul').html(),
                    TAinfo: '',
                    itinerary: [],
                    priceIncludes: $('.priceIncludes').html()
                }
                let TA = '';
                if ($('.highlights').find('.reviewDetail').length > 0) {
                    let taP = $('.highlights .reviewDetail').text();
                    let taFrom = $('.highlights .reviewDetail .byWho').text();
                    tap = taP.replace(taFrom, '');
                    let taLink = $('.highlights .reviewNumber a').attr('href');
                    TA = `<div class="reviews">
                    <p>${taP}<a href="${taLink}" target="_top">Read more</a></p>
                    <p class="reviewname">${taFrom}</p>
                    </div>`;
                    htmlData.TAinfo = TA;
                }
                // todo: .lastRead inquiry ;
                $('.touritinerary .TourList').each(function (i, tourlist) {
                    $(tourlist).children('.TourInfo').children().each(function (j, p){
                        if ($(p).find('img').length > 0) {
                            let imgsHtml = '';
                            for (let index = 0; index < $(p).find('img').length; index++) {
                                const imgE = $(p).find('img').eq(index);
                                imgsHtml += `<div class="tourimg"><img alt="${$(imgE).attr('alt')}" class="TopImage img-responsive" src="${$(imgE).attr('src')}"> <span class="imgname">${$(imgE).attr('alt')}</span></div>`;
                            }
                            $(p).replaceWith(imgsHtml);
                        }
                        if ($(p).find('.fa-cutlery').length > 0) {
                            let mealHtml = `<span class="Dinner">${$(p).text()}</span>`;
                            $(p).replaceWith(mealHtml);
                        }
                    });
                    let tourDay = {
                        day: $(tourlist).children('.TourDates').children('.TourDay').text(),
                        title: $(tourlist).children('.TourDates').text(),
                        TourInfo: $(tourlist).children('.TourInfo').html()
                    }
                    tourDay.title = tourDay.title.replace(tourDay.day, '');
                    htmlData.itinerary.push(tourDay);
                });
                let lastInfo = [];
                ($('.touritinerary .TourList').parent().children().each(function (i, el) {
                    if (!$(el).hasClass('TourList')) lastInfo.push($(el).prop('outerHTML'));
                }))
                htmlData.last = lastInfo.join('');
                // console.log(htmlData.last)
                // console.log("over");
                resolve(htmlData);
            }).on('error', function (e) {
                reject(e)
            });;
        })
    });
    return pm;
}

function tourTemplate(htmlJson) {
    let tourdetail = htmlJson.itinerary.map(tourD => {
        return `
<div class="tourbg">
  <div class="tourinfo"><span class="tourdate">${tourD.day}</span> <span class="toursite">${tourD.title}</span> ${tourD.TourInfo}
  </div>

</div>
        `;
    }).join('');
    let htmlStr = `
<!--description
${htmlJson.description}
-->
<!--keywords
${htmlJson.keywords}
-->

<div class="tournavi">
  <span class="TopNavi"><a href="#summary">Summary</a></span> <span class="TopNavi"><a href="#highlights">Highlights</a></span> <span class="TopNavi"><a href="#itinerary">Itinerary</a></span> <span class="TopNaviLast"><a href="#priceincludes">Price</a></span></div>

<div class="TopCht1"><img alt="${htmlJson.topImgAlt}" class="img-responsive" src="${htmlJson.topImg}" />

  <div class="Top10Title">
    <div class="toursubname">${htmlJson.tourSubName}</div>
    <h1 class="Top10">${htmlJson.tourName}</h1>
  </div>
</div>

<p>
  <a id="summary"></a>
</p>

<div class="maincontent">
  <!--<div class="medias"><amp-addthis data-pub-id="ra-52170b0a4a301edc" data-widget-id="odix" height="55" width="400"></amp-addthis></div>-->
  ${htmlJson.overview}
</div>

<div class="maincontent">
  <h2>Tour Highlights</h2>

  <ul class="infolist">
    ${htmlJson.highlights}
  </ul>
  ${htmlJson.TAinfo}

  <a id="itinerary"></a>
</div>
<div class="tourdetail">
  <h2>Suggested Itinerary</h2>
  ${tourdetail}
</div>

<div class="maincontent">
  ${htmlJson.last}
  ${htmlJson.priceincludes}
</div>

<div class="inquirybutton"><a href="#iqnuirybutton">Inquire <img alt="" class="img-responsive" height="10px" src="//data.chinahighlights.com/pic/amp-inquiry-button-arrow.png" width="16px"> </a></div>
<div class="tmbottom">
<p>INQUIRE ABOUT THIS TOUR</p>
<a id="iqnuirybutton"></a>

<form action="https://www.chinahighlights.com/secureforms/qi_save" id="quick_inquiry_form" method="post" name="quick_inquiry_form" novalidate="" onsubmit="return validateQuickInquiryForm()">
<div class="InquiryBox">
<p><input class="FullName" id="realname" name="realname" placeholder="Full name" type="text"> <span id="realname_errmsg" style="display: none"><span class="requiredArea">Please enter your full name</span></span></p>

<p><input class="EmailAddress" id="email" name="email" placeholder="Email" type="text"> <span id="email_errmsg" style="display: none"><span class="requiredArea">Please enter your email</span></span></p>

<p class="InquiryDate"><input class="InquiryCalendar flatpickr-input" data-min-date="7" id="starting_date" name="starting_date" placeholder="Starting date" readonly="readonly" type="text"><span id="starting_date_errmsg" style="display: none"><span class="requiredArea">Please verify your email</span></span></p>

<p><input class="Inquiryphone" id="PhoneNo" name="PhoneNo" placeholder="Any other quick ways to reach you..." style="padding-left: 50px;" type="tel"></p>

<p><t_e_x_t_a_r_e_a id="form_additionalrequirements" name="form_additionalrequirements" placeholder="Tell us your tour ideas: where to visit, how many people and days, and your hotel style..."></t_e_x_t_a_r_e_a></p>
<t_e_x_t_a_r_e_a name="nullemail" style="display: none"></t_e_x_t_a_r_e_a> <input name="cli_no" type="hidden" value="${htmlJson.tourCode}"> <input id="url" name="url" type="hidden" value="https://www.chinahighlights.com${htmlJson.url}"><button class="sendButton" id="quick_inquiry_button" name="quick_inquiry_button" type="submit">Send My Inquiry <i aria-hidden="true" class="fa fa-angle-right"></i></button></div>
</form>
</div>
    `;
    return htmlStr;
}

function writeFile(htmlStr, target_file_name = 'tmp') {
    target_file_name = target_file_name.replace(/^\/?|\/?$/g, '').replace(/\/+/g, '.') + '.html';
    fs.writeFileSync(target_file_name, htmlStr, function (err) {
        if (err) {
            console.log("write " + err.message)
            return
        }
    });
    // console.log("!");
}
