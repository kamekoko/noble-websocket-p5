var express = require('express');

var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const knownDevices = ['Blank','Blank2'];
const proximityJudgmentValue = -45;

const os = require('os');

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
    module.exports = require('noble');;
}

const noble = module.exports;

const checkDevice = (name) => {
    for (let i = 0; i < knownDevices.length; i++) {
        if (knownDevices[i] == name) return 1;
    }
    return 0;
}

const proximityJudgment = (rssi) => {
    if (rssi > proximityJudgmentValue) return 1;
    return 0;
}

const discovered = (peripheral) => {
    const device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address
    };

    if (checkDevice(device.name) == 1 && proximityJudgment(device.rssi) == 1) {
        console.log(device.name + ': ' + device.address + ', RSSI: ' + device.rssi);
        io.emit('address', device.name); // or device.address
    }
}

function scan() {
    noble.startScanning();
    noble.on('discover', discovered);
}

const scanStart = () => {
    setInterval(scan, 2000);
}

function newConnection(socket) {
    console.log('new connection: ' + socket.id);

    if(noble.state === 'poweredOn'){
        scanStart();
    } else {
        noble.on('stateChange', scanStart);
    }
}


console.log('noble');
console.log("My socket server is running");
io.sockets.on('connection', newConnection);
