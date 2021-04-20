console.log("hello");

const fs = require('fs');
var jsonObject = JSON.parse(fs.readFileSync('./farm.json', 'utf8'));

var treeObj = jsonObject[1].tree;

var length = Object.keys(treeObj).length;

// map //////////////////////////////////
const CANVAS_SIZE = 900;
var CR; // Conversion Ratio (m/pixel)

function setCR(pixel, m) {
    CR = m / pixel;
}

let convertDistToPixel = (m) => {
    return m / CR;
}

let map = jsonObject[0];
setCR(CANVAS_SIZE, Math.max(map.height, map.width));

let pixel = [];
for (let i = 0; i < length; i++) {
    pixel[i] = [];
    pixel[i][0] = treeObj[i].id;
    pixel[i][1] = convertDistToPixel(treeObj[i].coordinate[0]);
    pixel[i][2] = convertDistToPixel(treeObj[i].coordinate[1]);
}

console.log(pixel);

console.log(length);

console.log(treeObj[0].coordinate[0]);