module.exports = function(htmlJson) {
    let tourdetail = htmlJson.itinerary.map(tourD => {
        return `<div class="tourDatesBJ"><span class="tourDays">${tourD.day}</span> ${tourD.title}</div><div class="ItineraryContent">${tourD.TourInfo}  </div>`;
    }).join('');
    let tourDays = htmlJson.itineraryDays.map(tourD => {
        const li = tourD.dayTour.join(', ');
        return `<span class="day1Dot">${tourD.day}</span><b>${li}</b>`;
    }).join('');
    tourDays = tourDays !== '' ? `<div class="lineBlock">${tourDays}</div>` : '';

    let contentHtml = htmlJson.contentData.map((cp, i) => {
        let h = '';
        let f = '';
        if (i%3==0) {
            h += `<div class="listtour">`;
        }
        if (i%3==2 && i!==0) {
            f = '</div>';
        }
        h += `<div class="expatstour">${cp}</div>`;
        h += f;
        return h;
    }).join('')
    if (htmlJson.contentData.length > 0 && htmlJson.contentData.length % 3 !== 0) {
        contentHtml += '</div>';
    }

    let faqdetail = htmlJson.faq.map(tourD => {
        return `<h3>${tourD.title}</h3>${tourD.TourInfo}`;
    }).join('');
    faqdetail = faqdetail !== '' ? `<div class="maincontent"><h2>Trip Notes</h2>${faqdetail}</div>` : '';

    let overview = htmlJson.overview !== '' ? `<div class="maincontent">${htmlJson.overview}</div>` : '';
    let TAinfo = htmlJson.TAinfo !== '' ? `<div class="maincontent">${htmlJson.TAinfo}</div>` : '';
    let promote = htmlJson.promote !== '' ? `<div class="maincontent">${htmlJson.promote}</div>` : '';
    let serviceIncludes = htmlJson.serviceIncludes !== '' ? `<h2>Our Service Includes:</h2>${htmlJson.serviceIncludes}` : '';
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
https://proxy-data.chinahighlights.com/css/mobile-first.css
<link href="https://proxy-data.chinahighlights.com/css/mobile-first.css" rel="stylesheet">
-->

${htmlJson.last}
${serviceIncludes}
${contentHtml}

    `;
    return htmlStr;
}
