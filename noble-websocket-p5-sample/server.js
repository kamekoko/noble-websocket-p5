var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);


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
const knownDevices = ['56:88:25:78:5f:66','5e:fa:26:84:d4:0d'];





console.log('noble');
console.log("My socket server is running");

const discovered = (peripheral) => {
    const device = {
        name: peripheral.advertisement.localName,
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        address: peripheral.address
    };

    var exist = 0;
    for (let i = 0; i < knownDevices.length; i++) {
        if (knownDevices[i] == device.name) {
            exist = 1;
            break;
        }
    }
    if (exist == 1) {
        console.log(device.address);
        io.emit(device.address);
    }
}

const scanStart = () => {
    noble.startScanning();
    noble.on('discover', discovered);
}

io.sockets.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection: ' + socket.id);

    if(noble.state === 'poweredOn'){
        scanStart();
    }else{
        noble.on('stateChange', scanStart);
    }
}


// io.emit('address', '5e:fa:26:84:d4:0d');

