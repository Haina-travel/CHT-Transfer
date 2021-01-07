let fs = require('fs');
let http = require('https');
let cheerio = require('cheerio');

let transferPath = [
    { path: '/tour/cht-63/', code: 'cht-63' },
    // { path: '/tour/china-summer-vacations.htm', code: 'Summer-1' },
]
transferPath.forEach(function(ele, i) {
    loadPage(ele.path, ele.code).then(function(htmlJSON) {
        writeFile(tourTemplate(htmlJSON), ele.path);
    });
})

function loadPage(path, code = "") {
    let pm = new Promise(function(resolve, reject) {
        let options = {
            host: 'www.chinahighlights.com',
            path: path
                // port: 80,
        };
        let html = '';
        http.get(options, function(res) {
            res.on('data', function(data) {
                // collect the data chunks to the variable named "html"
                html += data;
            }).on('end', function() {
                let $ = cheerio.load(html);
                $('body').find('ul').each(function (i,ul) {
                    $(ul).attr('class','');
                    $(ul).addClass('infolist');
                })
                $('#booking_form_button, .InquiryButton').remove();
                let htmlData = {
                    tourCode: code,
                    url: path,
                    description: $('meta[name="description"]').attr('content'),
                    keywords: $('meta[name="keywords"]').attr('content'),
                    topImg: $('.TopCht1 img.visible-xs').length > 0 ? $('.TopCht1 img.visible-xs').attr('src') : $('.TopCht1 img').eq(0).attr('src'),
                    topImgAlt: $('.TopCht1 img.visible-xs').length > 0 ? $('.TopCht1 img.visible-xs').attr('alt') : $('.TopCht1 img').eq(0).attr('alt'),
                    tourSubName: $('.Top10').text(),
                    tourName: $('.TourItinerary').text(),
                    overview: '',
                    highlights: $('.TourHighlights ul').html(),
                    TAinfo: '',
                    itineraryDays: [],
                    itinerary: [],
                    itineraryP: '',
                    last: '',
                    promote: '',
                    onedayroute: $('.onedayroute').parent().html(),
                    priceIncludes: $('.TourPrice').length > 0 ? $('.TourPrice').prop('outerHTML') : ''
                }
                let overviewHtml = '';
                for (let index = 0; index < $('.tourHighlights').prevAll().length; index++) {
                    const nextE = $('.tourHighlights').prevAll().eq(index);
                    overviewHtml += $(nextE).prop('outerHTML');
                }
                htmlData.overview = overviewHtml;

                $('.earlyBird .freeUpgrade').remove('.InquiryButton');
                htmlData.promote = $('.earlyBird .freeUpgrade').prop('outerHTML');

                let TA = '';
                if ($('.reviewDetail').length > 0) {
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
                if ($('.reviewdetail').length > 0) {
                    let taP = $('.reviewdetail').text();
                    let taFrom = $('.reviewdetail .bywho').text();
                    tap = taP.replace(taFrom, '');
                    let taLink = $('.reviewNumber a').attr('href');
                    TA = `<div class="reviews">
                    <p>${taP}<a href="${taLink}" target="_top">Read more</a></p>
                    <p class="reviewname">${taFrom}</p>
                    </div>`;
                    htmlData.TAinfo = TA;
                }
                $('.TourItinerary').next('div').find('.TourDays').each(function(i, d){
                    let tmpD = {
                        day: $(d).children('b').text(),
                        dayTour: []
                    };
                    $(d).children('ul.TourSees').children().each(function(j, dt) {
                        tmpD.dayTour.push($(dt).text())
                    })
                    htmlData.itineraryDays.push(tmpD);
                });

                $('#itineraryDetails .TourList').each(function(i, tourlist) {
                    $(tourlist).children('.TourInfo').children().each(function(j, p) {
                        if ($(p).find('img').length > 0 ) {
                            let imgsPHtml = '';
                            for (let index = 0; index < $(p).find('img').length; index++) {
                                const imgE = $(p).find('img').eq(index);
                                if ($(imgE).parent().hasClass('NoteTitle')) {
                                    continue;
                                }
                                if ($(imgE).parent().parent().hasClass('NoteInfo')) {
                                    let imgsHtml = `<div class="tourimg"><img alt="${$(imgE).attr('alt')}" class="TopImage img-responsive" src="${$(imgE).attr('src')}"> <span class="imgname">${$(imgE).attr('alt')}</span></div>`;
                                    $(imgE).parent().replaceWith(imgsHtml);
                                } else {
                                    imgsPHtml += `<div class="tourimg"><img alt="${$(imgE).attr('alt')}" class="TopImage img-responsive" src="${$(imgE).attr('src')}"> <span class="imgname">${$(imgE).attr('alt')}</span></div>`;
                                }
                            }
                            if(imgsPHtml!=='') $(p).replaceWith(imgsPHtml);
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
                $('#itineraryDetails>p').each(function(i,p){
                    htmlData.itineraryP += $(p).prop('outerHTML');
                });

                // htmlData.last += $('.includeIcon').prop('outerHTML') + $('.whatIncluded').prop('outerHTML');
                $('.TopDetail').next('.container').find('div[class^="col-"],h2[class^="col-"]').each(function(i,p){
                    if ($(p).prop('tagName').toLowerCase()==='div') {
                        htmlData.last += $(p).html();
                        return true;
                    }
                    $(p).attr('class','');
                    htmlData.last += $(p).prop('outerHTML');
                })
                // console.log(htmlData.last)
                // console.log("over");
                resolve(htmlData);
            }).on('error', function(e) {
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
</div>`;
    }).join('');
    let tourDays = htmlJson.itineraryDays.map(tourD => {
        const li = tourD.dayTour.join(', ');
        return `<span class="day1Dot">${tourD.day}</span><b>${li}</b>`;
    }).join('');
    let htmlStr = `
<!--description
${htmlJson.description}
-->
<!--keywords
${htmlJson.keywords}
h1
${htmlJson.tourName}
sub
${htmlJson.tourSubName}
https://proxy-data.chinahighlights.com/css/tour-detail-former.css
-->
<link href="https://proxy-data.chinahighlights.com/css/tour-detail-former.css" rel="stylesheet">

<div class="tournavi">
  <span class="TopNavi"><a href="#summary">Summary</a></span> <span class="TopNavi"><a href="#highlights">Highlights</a></span> <span class="TopNavi"><a href="#itinerary">Itinerary</a></span> <span class="TopNaviLast"><a href="#priceincludes">Price</a></span></div>

<div class="TopCht1"><img alt="${htmlJson.topImgAlt}" class="img-responsive" src="${htmlJson.topImg}" />

  <div class="Top10Title">
    <div class="toursubname">${htmlJson.tourSubName}</div>
    <h1 class="Top10">${htmlJson.tourName}</h1>
  </div>
</div>
<div class="lineBlock">${tourDays}</div>
<div class="TopItinerary">
  <div class="TMcontent"><span class="TMtitle">Tailor Make Your Tour:</span>
  <ul class="infolist">
      <li>Your Schedule</li>
      <li>Your Interests</li>
      <li>Your Hotel Tastes</li>
  </ul>
  </div>
  <div class=" DetailTopTM">
  <div class="TopPrice">
  ${htmlJson.priceIncludes}
  </div>
  </div>
</div>
<div class="maincontent">
  <!--<div class="medias"><amp-addthis data-pub-id="ra-52170b0a4a301edc" data-widget-id="odix" height="55" width="400"></amp-addthis></div>-->
  ${htmlJson.overview}
</div>

<div class="highlights">
  <h2>Tour Highlights</h2>
${htmlJson.highlights}
</div>
<div class="maincontent">
${htmlJson.TAinfo}
</div>
<div class="maincontent">
${htmlJson.promote}
</div>
  <a id="itinerary"></a>
<div class="tourdetail">
  <h2>Itinerary Details</h2>
  ${htmlJson.itineraryP}
  ${tourdetail}
</div>

<div class="maincontent">
  ${htmlJson.last}
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

var path = require('path');
function writeFile(htmlStr, target_file_name = 'tmp') {
    target_file_name = target_file_name.replace(/^\/?|\/?$/g, '').replace(/\/+/g, '.') + '.html';
    fs.writeFileSync(path.join('v3', target_file_name), htmlStr, function(err) {
        if (err) {
            console.log("write " + err.message)
            return
        }
    });
    // console.log("!");
}
