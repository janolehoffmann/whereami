var locationDiv = document.getElementById('location');
var tableDiv = document.getElementById('table');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(processLocation, displayLocationError);
} else {
    displayLocationError();
}

function processLocation(position) {
    var nameUrl = "https://secure.geonames.org/findNearbyPostalCodesJSON?lat=" + position.coords.latitude + "&lng=" + position.coords.longitude + "&username=demo";

    $.getJSON(nameUrl, function (data) {
        var placeName = data.postalCodes[0].placeName;
        let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
        locationDiv.innerHTML = "<h2>You are in " + placeName + ", " + regionNames.of(data.postalCodes[0].countryCode) + "</h2>(Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude + ")";

        var contentURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&origin=*&format=json&exintro=&titles=" + placeName;
        $.getJSON(contentURL, function (contentData) {
            var query = contentData.query.pages;
            var key = Object.keys(query)[0];
            var extract = query[key].extract;

            if (extract == null || extract == "") {
                displayFactError();
                return;
            }

            var fact = findFact(extract, placeName);
            tableDiv.innerHTML += '<div class="content column"><b>Did you know? </b><br>' + fact + '</div>';
            tableDiv.innerHTML += '<div class="content column"><a href="https://www.google.de/maps/place/' + placeName + '" target="_blank">Find your way home!</a></div>';
        })
        .fail(function () {
            displayFactError();
        });
    })
    .fail(function () {
        displayLocationError();
    });
}

function findFact(extract, placeName) {
    var position = 0;
    var result = [];
    var searchTerm = ". " + placeName;

    //replace new line characters
    extract = extract.replace(/(\r\n|\n|\r)/gm, " ");

    //Find all sentences that start with 'placeName'
    while (extract.indexOf(searchTerm, position) != -1) {
        var newPosition = extract.indexOf(searchTerm, position);
        result.push(newPosition);
        position = newPosition + 1;
    }

    var startIndex = 0;
    if (result.length != 0) {
        var index = Math.floor(Math.random() * result.length);
        //searchTerm = ". " + placeName -> start two characters after
        startIndex = result[index] + 2;
    }

    //get substring from start index to next period
    return extract.substring(startIndex, extract.indexOf('. ', startIndex) + 1);
}

function displayLocationError() {
    locationDiv.innerHTML = '<span class="error">Sorry, could not find your location<span>';
}

function displayFactError() {
    tableDiv.innerHTML += '<div class="content column"><span class="error">Sorry, could not find a fact for your location<span></div>';
}