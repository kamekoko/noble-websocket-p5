var socket;

const BEACON_NUM = 10;
var addressState = [BEACON_NUM];

function setup() {
    createCanvas(2000, 2000);

    drawEllipses();

    socket = io.connect('http://localhost:3000');
    socket.on('address', newDrawing);
}

function newDrawing(data) {
    console.log('device: ' + data);

    addressState[data] = 1;
    drawEllipses();
}

function drawEllipses() {
    for (let i = 0; i <= BEACON_NUM; i++) {
        push();
        if (addressState[i] == 1) fill(255,0,0);
        const x = 50 + 50*(i%(BEACON_NUM/2));
        const y = (i < (BEACON_NUM/2))?50:150;
        ellipse(x, y, 20, 20);
        // text(i, x - 5, y + 5);
        pop();
    }
}