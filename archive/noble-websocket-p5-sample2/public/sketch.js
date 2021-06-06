var socket;

var tree_low;
var tree_col;
var tree_num;

var tree_len;
var tree_wid;
var tree_state;

var CR;

const UNSPRAYED = 0;
const SPRAYED = 1;

function setup() {
    createCanvas(900, 900);
    background(200,255,150);
    rectMode(CENTER);

    socket = io.connect('http://localhost:3000');

    // initilization
    deviceCount = 0;
    socket.on('map-data', initilize);

    // proximity detection
    // socket.on('address', newDrawing);
}

function initilize(data) {
    console.log(data);
    tree_low = data.low;
    tree_col = data.col;
    tree_num = tree_low * tree_col;
    tree_len = data.length;
    tree_wid = data.width;
    CR = data.CR;
    tree_state = [];
    for (let i = 0; i < tree_num; i++) {
        tree_state[i] = UNSPRAYED;
    }
    console.log("set complete");
    drawMap();
}

function drawMap() {
    for (let i = 0; i < tree_col; i++) {
        for (let j = 0; j < tree_low; j++) {
            push();
            // fill(255,165,0);
            if (tree_state[tree_col * i + j] == SPRAYED) fill(255, 0, 0);
            rect(3/CR+(tree_len*j), 3/CR+(tree_wid*i), 20, 20);
            console.log(i + "," + j + " : " + (50+(tree_len*j)) + "," + (50+(tree_wid*i)));
            pop();
            push();
            fill(0, 0, 255);
            stroke(0, 0, 255);
            ellipse(50+tree_len*j, 50+tree_wid/2+tree_wid*i, 5, 5);
            if (j != 0) line(50+tree_len*(j-1), 50+tree_wid/2+tree_wid*i, 50+tree_len*j, 50+tree_wid/2+tree_wid*i);
            pop();
        }
    }
}