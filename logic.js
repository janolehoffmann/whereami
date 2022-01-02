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
        x.innerHTML = "You are in " + placeName + ", " + data.postalCodes[0].countryCode + " (Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude + ")";

        var contentURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&origin=*&format=json&exintro=&titles=" + placeName;
        $.getJSON(contentURL, function (contentData) {
            var query = contentData.query.pages;
            var key = Object.keys(query)[0];
            var extract = query[key].extract;

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

            y.innerHTML = "<br> <b>Did you know? </b>" + fact;
        });

        z.innerHTML = '<br><a href="https://www.google.de/maps/place/' + placeName + '" target="_blank">Find your way home!</a>';
    });
}