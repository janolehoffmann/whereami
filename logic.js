var x = document.getElementById('location_text');
var y = document.getElementById('fact');
var z = document.getElementById('home');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getName);
} else {
    x.innerHTML = "Geolocation is not supported by this browser.";
}

function getName(position) {
    var nameUrl = "https://secure.geonames.org/findNearbyPostalCodesJSON?lat=" + position.coords.latitude + "&lng=" + position.coords.longitude + "&username=demo";

    $.getJSON(nameUrl, function (data) {
        var placeName = data.postalCodes[0].placeName;
        x.innerHTML = "<h2>You are in " + placeName + ", " + data.postalCodes[0].countryCode + "</h2>(Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude + ")";

        var contentURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&origin=*&format=json&exintro=&titles=" + placeName;
        $.getJSON(contentURL, function (contentData) {
            var error = false;
            var query = contentData.query.pages;
            var key = Object.keys(query)[0];
            var extract = query[key].extract;

            if (extract == null || extract == "") {
                displayFactError();
                return;
            }

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
            var fact = extract.substring(startIndex, extract.indexOf('. ', startIndex) + 1);

            if (error == true) {
                y.innerHTML = '<div class="content"><span class="error">Sorry, could not find a fact for your location<span></div>';
            } else {
                y.innerHTML = '<div class="content"><b>Did you know? </b><br>' + fact + '</div>';
            }
        })
        .fail(function() { 
            displayFactError();
        });

        z.innerHTML = '<div class="content"><a href="https://www.google.de/maps/place/' + placeName + '" target="_blank">Find your way home!</a></div>';
    })
    .fail(function() { 
        x.innerHTML = '<span class="error">Sorry, could not find your location<span>';
    });
}

function displayFactError() {
    y.innerHTML = '<div class="content"><span class="error">Sorry, could not find a fact for your location<span></div>';
}