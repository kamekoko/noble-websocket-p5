var socket;

const addressList = ['Blank','Blank2'];
var addressState = [addressList.length];
const BEACON_NUM = 10;

function setup() {
    createCanvas(2000, 2000);

    drawEllipses();

    socket = io.connect('http://localhost:3000');
    socket.on('address', newDrawing);
}

function newDrawing(data) {
    console.log('device name: ' + data);

    checkAddress(data);
    drawEllipses();
}

function checkAddress(ad) {
    for (let i = 0; i < addressList.length; i++) {
        if (ad == addressList[i]) {
            addressState[i] = 1;
            return;
        }
    }
}

function drawEllipses() {
    for (let i = 0; i <= BEACON_NUM; i++) {
        push();
        if (addressState[i] == 1) fill(255,0,0);
        ellipse(50 + 50*(i%(BEACON_NUM/2)), (i < (BEACON_NUM/2))?50:150, 20, 20);
        pop();
    }
}

// function draw() {
// }