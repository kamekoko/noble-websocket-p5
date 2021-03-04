var trilat = require('trilat');

class Node { // beacon for trilateration (three only)
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dist = 0;
    }
    updateDist(dist) {
        this.dist = dist;
    }
    updatePos(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}

var node1 = new Node(0, 0);
var node2 = new Node(5, 0);
var node3 = new Node(5, 5);

let createRssi = () => {
    var min = -80;
    var max = -50;
    let rssi = Math.floor(Math.random() * (max + 1 - min)) + min;
    return  rssi;
}

let rssiToDist = (rssi) => {
    const tx = -67; 
    let dist =  Math.pow(10.0, (tx - rssi)/20);
    return dist;
}

var getTrilatInput = (node1, node2, node3) => {
    console.log(node1);
    console.log(node2);
    console.log(node3);
    return  [
        [node1.x, node1.y, node1.dist],
        [node2.x, node2.y, node2.dist],
        [node3.x, node3.y, node3.dist]
    ];
}

node1.addDist(rssiToDist(createRssi()));
node2.addDist(rssiToDist(createRssi()));
node3.addDist(rssiToDist(createRssi()));

var output = trilat(getTrilatInput(node1, node2, node3));

console.log(output);