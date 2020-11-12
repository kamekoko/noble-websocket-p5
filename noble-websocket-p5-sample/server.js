// port: 3000

const fs = require('fs');
const os = require('os');
require('date-utils');

const jsonObject = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
const devicesAddress = []; // devices address
for (let i = 0; i < jsonObject.length; i++) {
    devicesAddress[i] = jsonObject[i].address;
}
const judgedDevices = [devicesAddress.length];
const proximityJudgmentValue = -60; //threshold
const timeInterval = 500; // time interval to get RSSI

const express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);


// noble
if (os.platform() === 'win32') {
    const ver = os.release().split('.').map(Number);
    if (!(ver[0] > 10 ||
        (ver[0] === 10 && ver[1] > 0) ||
        (ver[0] === 10 && ver[1] === 0 && ver[2] >= 15014))) {
        throw new Error('Noble WinRT bindings require Windows >= 10.0.15014.');
    }

    const Noble = require('noble/lib/noble');
    const { WinrtBindings } = require('./bindings.js');
    module.exports = new Noble(new WinrtBindings());
} else {
    module.exports = require('noble');
}
const noble = module.exports;


// log file
require('date-utils');
let now = new Date();
const fileName = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.txt');
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
const proximityJudgment = (rssi) => {
    return (rssi > proximityJudgmentValue) ? 1 : 0;
}

const check = (address, rssi) => {
    for (let i = 0; i < devicesAddress.length; i++) {
        if (devicesAddress[i] == address) {
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
    const index = check(device.address,device.rssi);

    if (index >= 0) {
        writeLog(device.address + ',RSSI: ' + device.rssi + ',Time: ' + now.toFormat('HH24:MI:SS'));
        io.emit('address', index);
        io.emit('name', device.name);
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

    if(noble.state === 'poweredOn'){
        scanStart();
    } else {
        noble.on('stateChange', scanStart);
    }
}

console.log("server and noble are running");
io.sockets.on('connection', newConnection);