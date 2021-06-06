// port: 3000

const fs = require('fs');
var jsonObject; 
    // = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const noble = require('noble-winrt');

console.log("server is running");


// log /////////////////////////////////////////////////////
require('date-utils');
let now = new Date();
var logFileName;

function createLogFile() {
    logFileName = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.csv');
    fs.writeFile(logFileName, '', function (err) {
        if (err) { throw err; }
        console.log(logFileName);
    });    
}

function writeLog (data) {
    fs.appendFile(logFileName, data + '\n', (err) => {
        if (err) throw err;
    })
}

// map ///////////////////////////////////////////////////////
const CANVAS_SIZE = 900;
var CR; // Conversion Ratio (m/pixel)

function setCR(pixel, m) {
    CR = m / pixel;
}

let convertDistToPixel = (m) => {
    return m / CR;
}

function setMap() {
    jsonObject = JSON.parse(fs.readFileSync('public/data-map/map.json', 'utf8'));
    let map = jsonObject[0];
    setCR(CANVAS_SIZE, Math.max(map.height, map.width));
    let length = convertDistToPixel(map.treeLength);
    let width = convertDistToPixel(map.treeWidth);
    let low = map.low;
    let col = map.col;
    io.emit('map-data', {low, col, length, width, CR});
    // io.emit('deviceNum', deviceNum);
    // for (let i = 0; i < deviceNum; i++) {
    //     io.emit('deviceLoc', i + "," + jsonObject[i].x + "," + jsonObject[i].y);
    // }
}



// poximity detection /////////////////////////////////////////
var deviceNum; 
    // = jsonObject.length;
const judgedDevices = [deviceNum];
const proximityJudgmentValue = -60; //threshold
const timeInterval = 200; // time interval to get RSSI

let proximityJudgment = (rssi) => {
    return (rssi > proximityJudgmentValue) ? 1 : 0;
}

let check = (address, rssi) => {
    for (let i = 0; i < deviceNum; i++) {
        if (jsonObject[i].address == address) {
            if (judgedDevices[i] == 1) break;
            if (proximityJudgment(rssi) == 1) {
                judgedDevices[i] = 1;
                return i;
            }
        }
    }
    return -1;
}

let discovered = (peripheral) => {
    let device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address,
        uuid: peripheral.uuid
    };
    let index = check(device.address,device.rssi);

    if (index >= 0) {
        now = new Date();
        writeLog(now.toFormat('HH24:MI:SS') + "," + device.address + ',' + device.rssi);
        io.emit('address', index);
    }
}

function scan() {
    noble.startScanning();
    noble.on('discover', discovered);
}

function scanStart() {
    setInterval(scan, timeInterval);
}

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    setMap();
    createLogFile();

    if(noble.state == 'poweredOn'){
        scanStart();
    } else {
        noble.on('stateChange', scanStart);
    }
}

io.sockets.on('connection', newConnection);