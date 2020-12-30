
var fs = require('fs');
var http = require('https');
var cheerio = require('cheerio');

var transferPath = [
    { path: '/tour/xiamentour/xm-1/', code: 'xm-1' },
    { path: '/tour/lijiangtour/lj-1/', code: 'lj-1' }
]
transferPath.forEach(function (ele, i) {
    loadPage(ele.path, ele.code).then(function (htmlJSON) {
        writeFile(tourTemplate(htmlJSON), ele.path);
    });
})

function loadPage(path, code="") {
    var pm = new Promise(function (resolve, reject) {
        var options = {
            host: 'www.chinahighlights.com',
            path: path
            // port: 80,
        };
        var html = '';
        http.get(options, function (res) {
            res.on('data', function (data) {
                // collect the data chunks to the variable named "html"
                html += data;
            }).on('end', function () {
                var $ = cheerio.load(html);
                var htmlData = {
                    tourCode: code,
                    description: $('meta[name="description"]').attr('content'),
                    keywords: $('meta[name="keywords"]').attr('content'),
                    topImg: $('.TopCht1 img.visible-xs').attr('src'),
                    topImgAlt: $('.TopCht1 img.visible-xs').attr('alt'),
                    tourSubName: $('.topheadline').text(),
                    tourName: $('#contentHead h1').text(),
                    overview: $('#contentHead').next().html(),
                    highlights: $('.highlights ul').html(),
                    itinerary: []
                }
                // todo: Dinner; infoimage,infoimagetitle; form
                $('.touritinerary .TourList').each(function (i, tourlist) {
                    var tourDay = {
                        day: $(tourlist).children('.TourDates').children('.TourDay').text(),
                        title: $(tourlist).children('.TourDates').text(),
                        TourInfo: $(tourlist).children('.TourInfo').html()
                    }
                    tourDay.title = tourDay.title.replace(tourDay.day, '');
                    htmlData.itinerary.push(tourDay);
                });
                var lastInfo = [];
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
    var tourdetail = htmlJson.itinerary.map(tourD => {
        return `
<div class="tourbg">
  <div class="tourinfo"><span class="tourdate">${tourD.day}</span> <span class="toursite">${tourD.title}</span> ${tourD.TourInfo}
  </div>

<!--<div class="tourimg"><img alt="Meet your guide at the airport" class="TopImage img-responsive" src="https://data.chinahighlights.com/image/tour-detail/amp-image/bj-1-day-1-1.jpg"> <span class="imgname">Meet your guide at the airport</span></div>-->
</div>
        `;
    }).join('');
    var htmlStr = `
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
  <!--
<div class="reviews">
<p>We had an amazing time in Beijing! Every day was filled with tourist activities and authentic activities. Our tour guide, Laura, was extremely flexible and accommodating. She made sure all of our needs were met. My daughter and I had many questions and she and our driver, Larry answered all of them. <a href="https://www.tripadvisor.com/ShowUserReviews-g294212-d6433772-r642134990-China_Highlights-Beijing.html" target="_top">Read more</a></p>
<p class="reviewname">Yogi Bear, from US</p>
</div>-->

  <a id="itinerary"></a>
</div>
<div class="tourdetail">
  <h2>Suggested Itinerary</h2>
  ${tourdetail}
</div>

<div class="maincontent">
  ${htmlJson.last}
</div>

<div class="footerBtn">
  <a href="/secureforms/inquiry?cli_no=${htmlJson.tourCode}" rel="nofollow" target="_top"><button type="submit">Inquiry Now<i aria-hidden="true" class="fa fa-angle-right"></i></button></a>
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
