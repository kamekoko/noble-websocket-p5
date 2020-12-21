let canvas;
let myMap;

const options = {
    lat: 36.27740138602258, 
    lng: 136.2676594478874,
    zoom: 18,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}
const mappa = new Mappa('Leaflet');

var socket;

function setup(){
    canvas = createCanvas(1200, 800);
    myMap = mappa.tileMap(options);
    myMap.overlay(canvas);

    // socket
    socket = io.connect('http://localhost:3000');
}

function draw(){
}
