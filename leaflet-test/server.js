const fs = require('fs');
var jsonObject;

var settings = require('./settings')
const express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

/////////////////////////////////////////////////////////////////////
// select farm map
/////////////////////////////////////////////////////////////////////
var mapCount;
fs.readdir('public/map', (err, files) => { 
    if (files.length == null) mapCount = 0; 
    else mapCount = files.length; 
})

function addMap(latlng) {
    let newGeoJSON = '{ "type": "Point", "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "coordinates": [' + latlng.lat + ', ' + latlng.lng + ']}';
    const mapfile = "public/map/map" + mapCount + ".geojson";
    fs.writeFileSync(mapfile, newGeoJSON);
    mapCount++;
    console.log("new map resistered");
}

/////////////////////////////////////////////////////////////////////
// select farm map
/////////////////////////////////////////////////////////////////////
function sendMaps() {
    var mapCount;
    fs.readdir('public/map', (err, files) => { 
        if (err || files.length == null) return;
        files.forEach(function (file) {
            const json = JSON.parse(fs.readFileSync('public/map/' + file, 'utf8'));
            io.emit('maplatlng', json.coordinates);
        })
    })

}


/////////////////////////////////////////////////////////////////////
// select farm map
/////////////////////////////////////////////////////////////////////
function addBeacon(pos) {
    let preData = fs.readFileSync("./data.json", 'utf8');

    let newData;
    if (deviceNum == 0) newData = '{"id": ' + (deviceNum + 1) + ', "name": "Blank", "address": "50:09:96:82:75:73","x": ' + pos[0] + ', "y": ' + pos[1] + '}]';
    else newData = ',{"id": ' + (deviceNum + 1) + ', "name": "Blank", "address": "50:09:96:82:75:73","x": ' + pos[0] + ', "y": ' + pos[1] + '}]';
    preData = preData.slice(0, -1);
    let data = preData + newData;
    fs.writeFileSync("./data.json", data);
    deviceNum ++;
    setMap();
}


/////////////////////////////////////////////////////////////////////
// noble
/////////////////////////////////////////////////////////////////////

const noble = require('noble-winrt');

// log file
require('date-utils');
let now = new Date();
const logfile = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.csv');

fs.writeFile(logfile, '', function (err) {
    if (err) { throw err; }
    console.log(logfile);
});

function writeLog (data) {
    fs.appendFile(logfile, data + '\n', (err) => {
        if (err) throw err;
    })
}

// poximity detection
var deviceNum = JSON.parse(fs.readFileSync('./data.json', 'utf8')).length;
var deviceStatus = [deviceNum];
const proximityJudgmentValue = -60; //threshold
const timeInterval = 500; // time interval to get RSSI
const DISCOVERED = 1;
const UNDISCOVERED = 0;
var previousTime;

const check = (address, rssi) => {
    const t = now.getTime();
    for (let i = 0; i < deviceNum; i++) {
        if (jsonObject[i].name == address) {
            if (previousTime == t) break;
            writeLog(now.toFormat('HH24:MI:SS') + "," + address + ',' + rssi);
            previousTime = t;
            if (rssi > proximityJudgmentValue && deviceStatus[i]== UNDISCOVERED) return i;
        }
    }
    return -1;
}

let discovered = (peripheral) => {
    let device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address
    };

    let index = check(device.name,device.rssi);

    if (index >= 0) {
        io.emit('address', index);
        deviceStatus[index]= DISCOVERED;
    }
}

function scan() {
    now = new Date();
    noble.startScanning();
    noble.on('discover', discovered);
}

function scanStart() {
    for (let i = 0; i < deviceNum; i++) {
        deviceStatus[i] = 0;
    }
    setInterval(scan, timeInterval);
    // scan();
}

function setMap() {
    jsonObject = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    io.emit('deviceNum', deviceNum);
    for (let i = 0; i < deviceNum; i++) {
        io.emit('deviceLoc', i + "," + jsonObject[i].x + "," + jsonObject[i].y);
    }
}

function nobleOn() {
    if(noble.state === 'poweredOn'){
        scanStart();
    } else {
        noble.on('stateChange', scanStart);
    }
}

/////////////////////////////////////////////////////////////////////
// new connection
/////////////////////////////////////////////////////////////////////

function newConnection(socket) {
    console.log('new connection: ' + socket.id);

    socket.on('marker', addMap);
    socket.on('openMapSelectPage', sendMaps);
    socket.on('newBeacon', addBeacon);
    socket.on('setmap', setMap);
    socket.on('noble', nobleOn);
}

console.log("server and noble are running");
io.sockets.on('connection', newConnection);