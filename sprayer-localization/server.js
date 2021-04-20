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

function create_log_file() {
    logFileName = 'log/' + now.toFormat('YYYY-M-D-HH24-MI-SS.csv');
    fs.writeFile(logFileName, '', function (err) {
        if (err) { throw err; }
        console.log(logFileName);
    });    
}


function write_log (data) {
    fs.appendFile(logFileName, data + '\n', (err) => {
        if (err) throw err;
    })
}


// map //////////////////////////////////
const CANVAS_SIZE = 900;
var CR; // Conversion Ratio (m/pixel)

let convert_dist_to_pixel = (m) => {
    return m / CR;
}

let make_tree_data = (tree_obj) => { // [ id, x, y ]
    let len = Object.keys(tree_obj).length;
    let trees = [];
    for (let i = 0; i < len; i++) {
        trees[i] = { "id" : tree_obj[i].id, "x" : convert_dist_to_pixel(tree_obj[i].coordinate[0]), "y" : convert_dist_to_pixel(tree_obj[i].coordinate[1]) };
    }
    return trees;
}

let make_aisle_data = (aisle_obj) => { // [ id, spray_point]
    let len = Object.keys(aisle_obj).length;
    let aisles = [];
    for (let i = 0; i < len; i++) {
        aisles[i] = { "id" : aisle_obj[i].id, "spray_point" : make_spray_point_data(aisle_obj[i].spray_point) };
    }
    return aisles;
}

let make_spray_point_data = (spray_point_obj) => { // [ id, x, y ]
    let len = Object.keys(spray_point_obj).length;
    let points = [];
    for (let i = 0; i < len; i++) {
        points[i] = { "id" : spray_point_obj[i].id, "x" : convert_dist_to_pixel(spray_point_obj[i].coordinate[0]), "y" : convert_dist_to_pixel(spray_point_obj[i].coordinate[1]) };
    }
    return points;
}

function set_map() {
    jsonObject = JSON.parse(fs.readFileSync('./farm.json', 'utf8'));

    let mapObj = jsonObject[0];
    CR = Math.max(mapObj.height, mapObj.width) / CANVAS_SIZE; // set CR

    let obj = jsonObject[1];
    io.emit('map', { "trees" : make_tree_data(obj.tree), "aisles" : make_aisle_data(obj.aisle) });
}

function new_connection(socket) {
    console.log('new connection: ' + socket.id);
    set_map();
}

io.sockets.on('connection', new_connection);