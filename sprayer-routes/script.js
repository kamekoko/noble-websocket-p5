let canvas;
let myMap;
let data;
let tripsCoordinates;
let allcoordinates = [];

let delta = 0;
let coordinate = 0;
let origin;
let originVector;
let destination;
let destinationVector;

let taxiPosition;
let visitedRoutes = [];


const options = {
    lat: 36.27740138602258, 
    lng: 136.2676594478874,
    zoom: 18,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

const mappa = new Mappa('Leaflet');

function preload(){
    data = loadJSON('./data/start.geojson');
}

function setup(){
    canvas = createCanvas(1200, 800);
    myMap = mappa.tileMap(options);
    myMap.overlay(canvas);

    tripsCoordinates = myMap.geoJSON(data, "LineString");

    tripsCoordinates.forEach(function(trip) {
        trip.forEach(function (coordinate){
            coordinate[0] -= 0.002;
            allcoordinates.push(coordinate);
        })
    });

    var x = [allcoordinates[0][0], allcoordinates[0][1]];
    var vLng = 0.0001;
    var vLat = 0.0001;
    for (let i = 0; i < 100; i++) {
        if (i % 3  == 0) vLng = -vLng;
        x = [x[0] + vLat, x[1] + vLng];
        allcoordinates.push(x);
    }

    // myMap.onChange(drawPoints);
    myMap.onChange(drawRoute);
}

function draw(){
    // clear(); // comented for drawRoute
    if (delta < 1){
        delta += 0.01;
    } else {
        visitedRoutes.push(allcoordinates[coordinate]);
        delta = 0;
        coordinate ++;
        drawRoute();
    }

    origin = myMap.latLngToPixel(allcoordinates[coordinate][1], allcoordinates[coordinate][0]);
    originVector = createVector(origin.x, origin.y);
    destination = myMap.latLngToPixel(allcoordinates[coordinate + 1][1], allcoordinates[coordinate + 1][0]);
    destinationVector = createVector(destination.x, destination.y);

    taxiPosition = originVector.lerp(destinationVector, delta);

    noStroke();
    fill(255, 255, 0);
    ellipse(taxiPosition.x, taxiPosition.y, 7, 7);
}

function drawPoints(){
    clear();
    noStroke();
    fill(255);
    for(var i = 0; i < allcoordinates.length; i++){
        var pos = myMap.latLngToPixel(allcoordinates[i][1], allcoordinates[i][0]);
        ellipse(pos.x, pos.y, 5, 5);
    }
}

function drawRoute(){
    clear();
    stroke(255, 0, 0, 40);
    strokeWeight(5);
    if(visitedRoutes.length > 0){
        noFill();
        beginShape();
        visitedRoutes.forEach(function (e) {
            var pos = myMap.latLngToPixel(e[1], e[0]);
            vertex(pos.x, pos.y);
        })
        endShape();
    }
}