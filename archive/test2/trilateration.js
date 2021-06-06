var trilat = require('trilat');
var fs = require('fs');
require('date-utils');
var now = new Date();

let createRssi = () => {
    var min = -80;
    var max = -50;
    let rssi = Math.floor(Math.random() * (max + 1 - min)) + min;
    return  rssi;
}

function calcEuclideanDistance(trilat, point) {
    var xDif = Math.abs(trilat[0] - point.x);
    var yDif = Math.abs(trilat[1] - point.y);
    var euclidean = Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
    console.log("euclidean distance to [" + point.x + "," + point.y + "] : " + euclidean);
    return Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
}

// State Machine
const isRouteOff = 0;
const isRouteOn = 1;
const closeRange = 2;

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
        this.rssi = _rssi;
        const tx = -67;
        this.dist =  Math.pow(10.0, (tx - this.rssi)/20);
        this.time = now.toFormat('HH24:MI:SS');
    }
    updatePos(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}

class State {
    constructor() {
        this.state = isRouteOff;
        var jsonObject = JSON.parse(fs.readFileSync('beaconLoc.json', 'utf8'));
        this.setBeacons(jsonObject);
        var jsonObject2 = JSON.parse(fs.readFileSync('routeLoc.json', 'utf8'));
        this.setRoutes(jsonObject2);
    }
    setBeacons(jsonObject) {
        this.beacons = [];
        for (let i = 0; i < jsonObject.length; i++) {
            this.beacons[i] = new Beacon(i, jsonObject[i].x, jsonObject[i].y);
        }
    }
    setRoutes(jsonObject2) {
        this.routes = [];
        this.startPoints = [];
        var count = 0;
        for (let i = 0; i < jsonObject2.length; i++) {
            this.routes[i] = jsonObject2[i];
            if (this.routes[i].isStartPoint == 0) continue;
            this.startPoints[count] = this.routes[i];
            count++;
        }
    }
    getTopThreeRssi() {
        var ans = [];
        var num = 0;
    
        var fpCopy = [];
        for (let i = 0; i < this.beacons.length; i++) {
            fpCopy[i] = this.beacons[i].rssi;
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
    getTrilatInput (_index1, _index2, _index3) {
        return [
            [this.beacons[_index1].x, this.beacons[_index1].y, this.beacons[_index1].dist],
            [this.beacons[_index2].x, this.beacons[_index2].y, this.beacons[_index2].dist],
            [this.beacons[_index3].x, this.beacons[_index3].y, this.beacons[_index3].dist],
        ];
    }
    updateLocation(trilat) {
        if (this.state == isRouteOff) {
            for (let i = 0; i < this.startPoints.length; i++) {
                if (calcEuclideanDistance(trilat, this.startPoints[i]) > closeRange) continue;
                this.state = isRouteOn;
                this.prePoint = this.startPoints[i];
                break;
            }
        }
    }
    showState() {
        if (this.prePoint == null) console.log("estimated location : null");
        else console.log("estimated location : [" + this.prePoint.x + ", " + this.prePoint.y + "]");
    }
}

// output
var state = new State();

// for (let i = 0; i < state.beacons.length; i++) {
//     state.beacons[i].updateRssi(createRssi());
// }

state.beacons[0].updateRssi(-69);
state.beacons[1].updateRssi(-78);
state.beacons[2].updateRssi(-75);
state.beacons[3].updateRssi(-94);
state.beacons[4].updateRssi(-88);
state.beacons[5].updateRssi(-90);

console.log("input : ");
for (let i = 0; i < state.beacons.length; i++) {
    console.log("beacon " + (state.beacons[i].index + 1) + " : [rssi : " + state.beacons[i].rssi + "] -> distance : " + state.beacons[i].dist);
}
var input = state.getTopThreeRssi();
console.log("beacons for trilateration : " + (input[0]+1) + "," + (input[1]+1) + "," + (input[2]+1));

var output = trilat(state.getTrilatInput(input[0], input[1], input[2]));

console.log();
console.log("trilateration output : [" + output[0] + ", " + output[1] + "]");

state.updateLocation(output);
state.showState();