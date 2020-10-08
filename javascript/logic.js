// VARIABLES
var instructionsEl = $("#instructions"); // jQuery variables
var safestStatesUl = $("#safestStates");
var moderateStatesUl = $("#moderateStates");
var dangerStatesUl = $("#dangerStates");
var accordionDiv = $("#accordionContainer");

var hasStart = false;
var start = "";
var routeData = "";
var stateList = [];

var googleAPIKEY = "AIzaSyAGcHIXpsKnSTicnC-IV0jrSRib9aUQ0ys";
var mapID = "e3babd9703ebde3a"

// ==========================================================================================================================
// MAP INITIALIZATION

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN0aW5ha2VyciIsImEiOiJja2Z5NWhpY3EwNjE5MzRwajZmb3NzOHl2In0.spaOh4Gw5ZoKnJ0P9RpaUA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-96, 39], // starting position at the center of the US
    zoom: 4
});
var canvas = map.getCanvasContainer();
map.addControl(new mapboxgl.NavigationControl());


// ==========================================================================================================================
// FUNCTIONS

function getRoute(end, start) { // Request directions from mapbox

    var url = 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function (response) {
        routeData = JSON.parse(req.response);
        var data = routeData.routes[0];
        var route = data.geometry.coordinates;
        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };

        // if the route already exists on the map, reset it
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else {           // otherwise, make a new request
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: geojson
                        }
                    }
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
            map.getSource('route').setData(geojson);
        }
        getCountyName(routeData.routes[0].geometry.coordinates); // Use coordinates of places along the route to get county names

    };
    req.send();

}

function getCountyName(coordArray) {

    var promisedResults = coordArray.map(function (coordinate) { // Get county name from coordinates
        var lon = coordinate[0];
        var lat = coordinate[1];
        var googleURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&result_type=administrative_area_level_2&key=" + googleAPIKEY;
        return $.ajax({
            method: "GET",
            url: googleURL
        })
    });
    Promise.all(promisedResults).then(function (responses) {
        responses.forEach(function (response) {
            // var county = response.results[0].address_components[0].long_name; 
            //Previously we were looking at counties. I may come back to this

            var state = response.results[0].address_components[1].long_name; // Collect state names
            // countyList.push(county);
            stateList.push(state);
        });

        // console.log(countyList);
        console.log(stateList);

        var uniqueStates = [];
        stateList.forEach((state) => {
            if (!uniqueStates.includes(state)) {
                uniqueStates.push(state);
            }
        });

        console.log(uniqueStates);

        var covidURL = "https://disease.sh/v3/covid-19/states?sort=todayCases&yesterday=true";

        var covidData = $.ajax({
            method: "GET",
            url: covidURL
        })


        var covidRates = [];
        var covidStates = [];

        covidData.done(function(data){
            console.log(data);
            uniqueStates.forEach(function(state){
                data.forEach(function(covid){
                    if (state == covid.state){
                    covidRates.push(covid.casesPerOneMillion);
                    covidStates.push(covid.state)
                    }
                })
            })
            console.log(covidRates);
            console.log(covidStates);
            accordionDiv.show();
            for (var i = 0; i < covidRates.length; i++){
                if (covidRates[i] <= 23000){
                    var safeLi = $(`
                    <li>${covidStates[i]}</li>
                    `)
                    safestStatesUl.append(safeLi);
                } else if (covidRates[i] > 23000 && covidRates[i] <= 28000) {
                    var moderateLi = $(`
                    <li>${covidStates[i]}</li>
                    `)
                    moderateStatesUl.append(moderateLi);
                } else if (covidRates[i] > 28000){
                    var dangerLi = $(`
                    <li>${covidStates[i]}</li>
                    `)
                    dangerStatesUl.append(dangerLi);
                }
            }
            console.log(safestStatesUl, moderateStatesUl, dangerStatesUl)
        })
        
    })
}


// ==========================================================================================================================
// EVENT LISTENERS ETC

accordionDiv.hide();

map.on('load', function () {

    map.on("click", function (e) { // Event handler for clicking on the map

        if (hasStart === false) { // If a start location hasn't been selected yet, choose start
            hasStart = true;
            var startCoords = e.lngLat;
            canvas.style.cursor = '';
            start = Object.keys(startCoords).map(function (key) {
                return startCoords[key];
            });

            instructionsEl.text("Now tap to select your destination."); // Change instructions now that starting point is selected

            // Add starting point to the map
            map.addLayer({
                id: 'start',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: start
                            }
                        }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#3887be'
                }
            })
        } else if (hasStart === true) { // If there is a start location, choose the end location.
            var coordsObj = e.lngLat;
            canvas.style.cursor = '';
            var coords = Object.keys(coordsObj).map(function (key) {
                return coordsObj[key];
            });

            instructionsEl.text(""); // Clear instructions section

            var end = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: coords
                    }
                }
                ]
            };
            if (map.getLayer('end')) {
                map.getSource('end').setData(end);
            } else {
                map.addLayer({ // Add ending point to map
                    id: 'end',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: coords
                                }
                            }]
                        }
                    },
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#f30'
                    }
                });
            }
            getRoute(coords, start);
        }
    });

})

// ========================================================================================================
// County accordion list

var accordion = document.getElementsByClassName("accordion");

for (var i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener("click", function () {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

// ==========================================================================================================================
        // The more complicated version of COVID rates that didn't work -- might come back to this later


        // for (var i =0; i< countyList.length; i++){
        //     var eachCounty = countyList[i].replace("County", ""); // Get covid data for each county
        //     console.log(eachCounty);
        //     var covidURL = "https://disease.sh/v3/covid-19/nyt/counties/" + eachCounty +"?lastdays=1";
        //     var countyState = countyList[i] + ", " + stateList[i];
        //     console.log(countyState);

        //     $.ajax({
        //         method: "GET",
        //         url: covidURL
        //     }).then(function (response){
        //         var covidTotal = response[0].cases; // Use state to get the correct county
        //         console.log(covidTotal);

        //         var censusFIPSurl = "https://api.census.gov/data/2010/dec/sf1?get=NAME&for=county:*"

        //         $.ajax({
        //             method: "GET",
        //             url: censusFIPSurl
        //         }).then(function(response){    // Get FIPS ID number for each county
        //             response.forEach(function(countyData) {

        //                 if (countyData[0] == countyState){
        //                     countyFIPS = countyData[2];
        //                     stateFIPS = countyData[1];
                        
        //                 }
        //                 console.log(countyFIPS, stateFIPS);
        //             })
        //         })

        //         //var censusURL = "https://api.census.gov/data/2019/pep/population?get=" + eachCounty + &for=region:*"&key="
        //     })
        // }