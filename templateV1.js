
module.exports = function(htmlJson) {
    let tourdetail = htmlJson.itinerary.map(tourD => {
        return `<div class="tourDatesBJ"><span class="tourDays">${tourD.day}</span> ${tourD.title}</div><div class="ItineraryContent">${tourD.TourInfo}  </div>`;
    }).join('');
    let tourDays = htmlJson.itineraryDays.map(tourD => {
        const li = tourD.dayTour.join(', ');
        return `<span class="day1Dot">${tourD.day}</span><b>${li}</b>`;
    }).join('');
    tourDays = tourDays!=='' ? `<div class="lineBlock">${tourDays}</div>` : '';

    let contentHtml = htmlJson.contentData.map(cp => {
        return `${cp.anchor}<h2>${cp.title}</h2>${cp.content}`;
    }).join('');

    let faqdetail = htmlJson.faq.map(tourD => {
        return `<h3>${tourD.title}</h3>${tourD.TourInfo}`;
    }).join('');
    faqdetail = faqdetail!=='' ? `<div class="maincontent"><h2>Trip Notes</h2>${faqdetail}</div>` : '';

    let overview = htmlJson.overview!=='' ? `<div class="maincontent">${htmlJson.overview}</div>` : '';
    let TAinfo = htmlJson.TAinfo!=='' ? `<div class="maincontent">${htmlJson.TAinfo}</div>` : '';
    let promote = htmlJson.promote!=='' ? `<div class="maincontent">${htmlJson.promote}</div>` : '';
    let serviceIncludes = htmlJson.serviceIncludes!=='' ? `<h2>Our Service Includes:</h2>${htmlJson.serviceIncludes}` : '';
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

<div class="Top10">
   <img alt="${htmlJson.topImgAlt}" class="img-responsive" src="${htmlJson.topImg}">
  <div class="container ">
  <div class="Top10Title">
  <h1 class="Top10">${htmlJson.tourName}</h1>
  </div>
  </div>
  </div>
  <a id="summary"></a>
${tourDays}
  ${htmlJson.priceIncludes}
  ${overview}


<div class="highlights">
  <a id="highlights"></a>
  <h2>Tour Highlights</h2>
${htmlJson.highlights}
</div>
${TAinfo}
${promote}

<!--   <a id="itinerary"></a>
  <h2>Suggested Itinerary</h2>
<div class="TourDetail"><div class="daytourBox">
$ {tourdetail}
</div></div>  -->

${contentHtml}
${faqdetail}
<div class="maincontent">
  ${htmlJson.last}
  ${serviceIncludes}
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

<p><textarea id="form_additionalrequirements" name="form_additionalrequirements" placeholder="Tell us your tour ideas: where to visit, how many people and days, and your hotel style..."></textarea></p>
<textarea name="nullemail" style="display: none"></textarea> <input name="cli_no" type="hidden" value="${htmlJson.tourCode}"> <input id="url" name="url" type="hidden" value="https://www.chinahighlights.com${htmlJson.url}"><button class="sendButton" id="quick_inquiry_button" name="quick_inquiry_button" type="submit">Send My Inquiry <i aria-hidden="true" class="fa fa-angle-right"></i></button></div>
</form>
</div>
    `;
    return htmlStr;
}
