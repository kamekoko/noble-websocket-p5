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
    createCanvas(500, 690);
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
    tree_low = data.low;
    tree_col = data.col;
    tree_num = tree_low * tree_col;
    tree_len = data.length;
    tree_wid = data.width;
    CR = data.CR;
    tree_state = [];
    for (let i = 0; i < tree_num; i++) {
        if (i == 0 || i == 4 || i == 1 || i == 5) tree_state[i] = SPRAYED;
        else tree_state[i] = UNSPRAYED;
    }
    drawMap();
}

function drawMap() {
    console.log("estimated location : " + null);
    for (let i = 0; i < tree_col; i++) {
        for (let j = 0; j < tree_low; j++) {
            push();
            // fill(255,165,0);
            if (tree_state[tree_col * i + j] == SPRAYED) fill(255, 0, 0);
            rect(3/CR+(tree_len*j), 3/CR+(tree_wid*i), 20, 20);
            pop();
            push();
            stroke(190, 213, 221);
            if (i == 0 && j == 1) line(3/CR+tree_len*(j-1), 3/CR+tree_wid/2+tree_wid*i, 3/CR+tree_len*j, 3/CR+tree_wid/2+tree_wid*i);
            if (j == 1 && i == 0) {
                fill(0, 0, 255);
                console.log("estimated location : [0, 2.5]");
                ellipse(3/CR+tree_len*j, 3/CR+tree_wid/2+tree_wid*i, 20, 20);
            }
            if (j == 0 && i == 0) {
                fill(190, 213, 221);
                console.log("estimated location : [5, 2.5]");
                ellipse(3/CR+tree_len*j, 3/CR+tree_wid/2+tree_wid*i, 20, 20);
            }
            pop();
        }
    }
}