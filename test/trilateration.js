var trilat = require('trilat');
require('date-utils');
var now = new Date();

let createRssi = () => {
    var min = -80;
    var max = -60;
    let rssi = Math.floor(Math.random() * (max + 1 - min)) + min;
    return  rssi;
}

let rssiToDist = (rssi) => {
    const tx = -67; 
    let dist =  Math.pow(10.0, (tx - rssi)/20);
    return dist;
}

class Beacon { // beacon for trilateration (three only)
    constructor(_index, _x, _y) {
        this.index = _index;
        this.x = _x;
        this.y = _y;
        this.rssi = 0;
        this.dist = 0;
        now = new Date();
        this.time = now.toFormat('HH24:MI:SS');
    }
    updateRssi(_rssi) {
        this.rssi = _rssi
        this.dist = rssiToDist(_rssi);
        this.time = now.toFormat('HH24:MI:SS');
    }
    updatePos(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}


var fingerprint = [];

var getTrilatInput = (_index1, _index2, _index3) => {
    return  [
        [fingerprint[_index1].x, fingerprint[_index1].y, fingerprint[_index1].dist],
        [fingerprint[_index2].x, fingerprint[_index2].y, fingerprint[_index2].dist],
        [fingerprint[_index3].x, fingerprint[_index3].y, fingerprint[_index3].dist],
    ];
}

let getTopThreeRssi = () => {
    var ans = [];
    var num = 0;

    var fpCopy = [];
    for (let i = 0; i < fingerprint.length; i++) {
        fpCopy[i] = fingerprint[i].rssi;
    }

    while (num < 3) {
        var topIndex = 0;
        var topVal = fpCopy[0]; 
        for (let i = 1; i < fpCopy.length; i++) {
            if (topVal < fpCopy[i]) {
                topIndex = i;
                topVal = fpCopy[i];
            }
        }
        ans[num] = topIndex;
        fpCopy[topIndex] = -1000;
        num++;
    }

    return ans;
}

fingerprint[0] = new Beacon(0, 0, 0);
fingerprint[1] = new Beacon(1, 5, 0);
fingerprint[2] = new Beacon(2, 5, 5);
fingerprint[3] = new Beacon(3, 0, 5);
fingerprint[4] = new Beacon(4, 10, 0);
for (let i = 0; i < fingerprint.length; i++) {
    fingerprint[i].updateRssi(createRssi());
}

for (let i = 0; i < fingerprint.length; i++) {
    console.log(fingerprint[i].index + " : " + fingerprint[i].rssi);
}
var input = getTopThreeRssi();
console.log(input);

var output = trilat(getTrilatInput(input[0], input[1], input[2]));

console.log(output);