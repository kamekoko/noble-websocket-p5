const fs = require('fs');
var jsonObject; 
    // = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const express = require('express');
var app = express();
var server = app.listen(3000);
app.use(express.static('public'));

var socket = require('socket.io');
var io = socket(server);

const noble = require('noble-winrt');

console.log("server is running");

// log ////////////////////////////////////////////
require('date-utils');
let now = new Date();
var logFileName;

function createLogFile() {
    logFileName = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.csv');
    fs.writeFile(logFileName, '', function (err) {
        if (err) { throw err; }
        console.log(logFileName);
    });    
}


function writeLog (data) {
    fs.appendFile(logFileName, data + '\n', (err) => {
        if (err) throw err;
    })
}


// map //////////////////////////////////
const CANVAS_SIZE = 900;
var CR; // Conversion Ratio (m/pixel)

function setCR(pixel, m) {
    CR = m / pixel;
}

let convertDistToPixel = (m) => {
    return m / CR;
}

function setMap() {
    jsonObject = JSON.parse(fs.readFileSync('./farm.json', 'utf8'));
    let map = jsonObject[0];
    setCR(CANVAS_SIZE, Math.max(map.height, map.width));
    let length = convertDistToPixel(map.treeLength);
    let width = convertDistToPixel(map.treeWidth);
    let low = map.low;
    let col = map.col;
    // io.emit('map-data', {length});

    let map2 = jsonObject[1];
    io.emit('tree-data', map2.tree); //こっちでCRでピクセルに直してから提供したほうがいいね、両方でCR管理する意味なし
}