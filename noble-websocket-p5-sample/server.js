// port: 3000

const fs = require('fs');
const jsonObject = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const express = require('express');
var app = express();
var server = app.listen(3000);
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
        console.log(data);
    })
}


// poximity detection
const deviceNum = jsonObject.length;
const judgedDevices = [deviceNum];
const proximityJudgmentValue = -60; //threshold
const timeInterval = 200; // time interval to get RSSI

const proximityJudgment = (rssi) => {
    return (rssi > proximityJudgmentValue) ? 1 : 0;
}

const check = (name, rssi) => {
    for (let i = 0; i < deviceNum; i++) {
        if (jsonObject[i].name == name) {
            if (judgedDevices[i] == 1) break;
            if (proximityJudgment(rssi) == 1) {
                judgedDevices[i] = 1;
                return i;
            }
        }
    }
    return -1;
}

const discovered = (peripheral) => {
    const device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address,
        uuid: peripheral.uuid
    };
    const index = check(device.name,device.rssi);

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