console.log("hello");

class Beacon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    addDist(dist) {
        this.dist = dist;
    }
}

let createRssi = () => {
    var min = -80;
    var max = -45;

    let rssi = Math.floor(Math.random() * (max + 1 - min)) + min;
    console.log("rssi : " + rssi);

    return  rssi;
}

let rssiToDist = (rssi) => {
    const tx = -67; 
    let dist =  Math.pow(10.0, (tx - rssi)/20);
    console.log("dist : " + dist);
    return dist;
}

let getTrilatelation = (pos1, pos2, pos3) => {
    var xa = pos1.x;
    var ya = pos1.y;
    var xb = pos2.x;
    var yb = pos2.y;
    var xc = pos3.x;
    var yc = pos3.y;
    var ra = pos1.dist;
    var rb = pos2.dist;
    var rc = pos3.dist;
    console.log(xa + "," + ya + "," + ra);
    console.log(xb + "," + yb + "," + rb);
    console.log(xc + "," + yc + "," + rc);
    

    var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
    var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
    var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
    var x = ((y * (ya - yb)) - T) / (xa - xb);

    console.log("S: " + S + " , T: " + T);

    return {
        x: x,
        y: y
    };
} 


var beacon1 = new Beacon(0, 0);
var beacon2 = new Beacon(0, 100);
var beacon3 = new Beacon(100, 0);
beacon1.addDist(107.70);
beacon2.addDist(40.0);
beacon3.addDist(116.619);

// beacon1.addDist(rssiToDist(createRssi()));
// beacon2.addDist(rssiToDist(createRssi()));
// beacon3.addDist(rssiToDist(createRssi()));

let selfPos = getTrilatelation(beacon1, beacon2, beacon3);
console.log(selfPos.x + " , " + selfPos.y);
