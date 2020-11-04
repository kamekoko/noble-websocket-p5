var socket;

const addressList = ['5e:fa:26:84:d4:0d'];
const BEACON_NUM = 10;

function setup() {
    createCanvas(2000, 2000);

    for (let i = 0; i <= BEACON_NUM; i++) {  
        ellipse(50 + 50*(i%(BEACON_NUM/2)), (i < (BEACON_NUM/2))?50:150, 20, 20);
    }

    socket = io.connect('http://localhost:3000');
    socket.on('address', newDrawing);
}

function newDrawing(data) {
    var index = checkAddress(data);
    if (index >= 0) {
        for (let i = 0; i <= BEACON_NUM; i++) {
            push();
            if (i == index) fill(255,0,0);
            ellipse(50 + 50*(i%(BEACON_NUM/2)), (i < (BEACON_NUM/2))?50:150, 20, 20);
            pop();
        }
    }
}

function checkAddress(ad) {
    for (let i = 0; i < addressList.length; i++) {
        if (ad == addressList[i]) return i;
    }
    return -1;
}

function draw() {
}