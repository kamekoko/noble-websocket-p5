var socket;

var DEVICE_NUM;
var devicesState;
var devicesX;
var devicesY;
var deviceCount;

function setup() {
    createCanvas(2000, 2000);

    socket = io.connect('http://localhost:3000');

    // initilization
    deviceCount = 0;
    socket.on('deviceNum', initilize);
    socket.on('deviceLoc', mapDevice);

    // proximity detection
    socket.on('address', newDrawing);
}

function initilize(data) {
    DEVICE_NUM = data;
    devicesState = Array(DEVICE_NUM);
    devicesX = Array(DEVICE_NUM);
    devicesY = Array(DEVICE_NUM);
}

function mapDevice(data) {
    let splitString = split(data, ','); // [index, x, y]
    let i = splitString[0];
    devicesX[i] = splitString[1];
    devicesY[i] = splitString[2];
    deviceCount += 1;
    console.log('device ' + i + ': (' + devicesX[i] + ',' + devicesY[i] + ')');
    if (deviceCount == DEVICE_NUM) {
        console.log('scan start');
        drawEllipses();
    }
}

function newDrawing(data) {
    console.log('proximity detect: ' + data);
    devicesState[data] = 1;
    drawEllipses();
}

function drawEllipses() {
    for (let i = 0; i < DEVICE_NUM; i++) {
        push();
        if (devicesState[i] == 1) fill(255,0,0);
        ellipse(devicesX[i], devicesY[i], 20, 20);
        pop();
    }
}