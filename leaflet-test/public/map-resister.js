var mymap = L.map('mapid').setView([36.27740138602258, 136.2676594478874], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(mymap);

var socket;
socket = io.connect('http://localhost:3000');

var marker;
var markerCount = 0;
mymap.on('contextmenu', function(e) {
    if (markerCount > 0) return;
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    marker = L.marker([lat, lng]).addTo(mymap);
    marker.bindPopup("OK?").openPopup();
    markerCount++;
})

function resetMarker() {
    if (markerCount <= 0) return;
    mymap.removeLayer(marker);
    markerCount--;
}

function resisterMarker() {
    if (markerCount <= 0) return;
    socket.emit('marker', marker.getLatLng());
}

