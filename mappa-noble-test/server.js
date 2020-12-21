// port: 3000

const fs = require('fs');
const jsonObject = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const express = require('express');
var app = express();
var server = app.listen(3000); //'150.65.172.246'
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const noble = require('noble-winrt');


// log file
require('date-utils');
let now = new Date();
const fileName = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.csv');

fs.writeFile(fileName, '', function (err) {
    if (err) { throw err; }
    console.log(fileName);
});

function writeLog (data) {
    fs.appendFile(fileName, data + '\n', (err) => {
        if (err) throw err;
        //console.log(data);
    })
}


// poximity detection
const deviceNum = jsonObject.length;
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
    // console.log("hoge");
    let device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address
    };
    // console.log(device.address);

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
    io.emit('deviceNum', deviceNum);
    for (let i = 0; i < deviceNum; i++) {
        io.emit('deviceLoc', i + "," + jsonObject[i].x + "," + jsonObject[i].y);
    }
}

function newConnection(socket) {
    console.log('new connection: ' + socket.id);

    setMap();

    if(noble.state === 'poweredOn'){
        scanStart();
    } else {
        noble.on('stateChange', scanStart);
    }
}

console.log("server and noble are running");
io.sockets.on('connection', newConnection);