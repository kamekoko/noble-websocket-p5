var socket;
socket = io.connect('http://localhost:3000');

socket.emit('openMapSelectPage', "");
socket.on('maplatlng', printFiles);

// leaflet //////////////////////////////////////////////////////////////////
var mymap = L.map('mapid').setView([36.27740138602258, 136.2676594478874], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);
/////////////////////////////////////////////////////////////////////////////

var marker;
var mapCount = 1;

function setMarker(latlng) {
    marker = L.marker([latlng[0], latlng[1]]).addTo(mymap);
    marker.bindPopup("圃場" + mapCount).openPopup();
}

function printFiles(latlng) {
    var node = document.createElement('radio');
    node.innerHTML = '<input type="radio" name="farm" id="check' + mapCount + '" value="' + mapCount + '">' + '圃場' + mapCount;
    document.getElementById("mapList").appendChild(node);
    setMarker(latlng);
    mapCount ++;
}