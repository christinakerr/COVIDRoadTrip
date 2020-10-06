// VARIABLES


// MAP INITIALIZATION

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXN0aW5ha2VyciIsImEiOiJja2Z5NWhpY3EwNjE5MzRwajZmb3NzOHl2In0.spaOh4Gw5ZoKnJ0P9RpaUA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [-96, 39], // starting position
    zoom: 4
});


// set the bounds of the map
// var bounds = [[-67, 25], [-124, 49]];
// map.setMaxBounds(bounds);

// initialize the map canvas to interact with later
var canvas = map.getCanvasContainer();
// Initialize a place for the map to start
var start = [-122.662323, 45.523751];



// FUNCTIONS

// create a function to make a directions request
function getRoute(end) {

    // var start = [-122.662323, 45.523751];
    var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
        var json = JSON.parse(req.response);
        var data = json.routes[0];
        var route = data.geometry.coordinates;
        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        // if the route already exists on the map, reset it using setData
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else { // otherwise, make a new request
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
        }
        // add turn instructions here at the end
    };
    req.send();
}

map.on('load', function () {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start);

    // Add starting point to the map
    map.addLayer({
        id: 'point',
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
    });
    // var instructions = document.getElementById('instructions');
    // var steps = data.legs[0].steps;

    // var tripInstructions = [];
    // for (var i = 0; i < steps.length; i++) {
    //     tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
    //     instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(data.duration / 60) + ' min 🚴 </span>' + tripInstructions;
    // }
});



// EVENT LISTENERS ETC

map.on('click', function (e) {
    var coordsObj = e.lngLat;
    canvas.style.cursor = '';
    var coords = Object.keys(coordsObj).map(function (key) {
        return coordsObj[key];
    });
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
        map.addLayer({
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
    getRoute(coords);
});


//  https://api.mapbox.com/directions/v5/mapbox/driving/-97.733330,30.266666;-95.358421,29.749907?access_token=pk.eyJ1IjoiY2hyaXN0aW5ha2VyciIsImEiOiJja2Z5NWhpY3EwNjE5MzRwajZmb3NzOHl2In0.spaOh4Gw5ZoKnJ0P9RpaUA