var socket;

const TREE = 0;
const AISLES = 1;
const SPRAY_POINT = 2;

const UNSPRAYED = 0;
const SPRAYED = 1;

var mp;

class Map {
    constructor(map_data) {
        this.trees = map_data.trees;
        this.tree_state = this.initilize_state(this.trees.length);
        this.aisles = map_data.aisles;
        this.asile_state = this.initilize_state(this.aisles.length);
        var spray_point_count = 0;
        for (let i = 0; i < this.aisles.length; i++) {
            spray_point_count += this.aisles[i].spray_point.length;
        }
        this.spray_point_state = this.initilize_state(spray_point_count);
    }

    initilize_state(len) {
        var states = [];
        for (let i = 0; i < len; i++) {
            states[i] = UNSPRAYED;
        }
        return states;
    }

    get_state(num, id) {
        switch (num) {
            case TREE :
                return this.tree_state[id - 1];
            case AISLES :
                return this.asile_state[id - 1];
            case SPRAY_POINT :
                return this.spray_point_state[id - 1];
            default :
                console.log('get state error');
        }
    }

    update_state(num, id) {
        switch (num) {
            case TREE :
                this.tree_state[id - 1] = SPRAYED;
            case AISLES :
                this.asile_state[id - 1] = SPRAYED;
            case SPRAY_POINT :
                this.spray_point_state[id - 1] = SPRAYED;
            default :
                console.log('update state error');
        }
    }

    draw_map() {
        push();
        console.log("estimated location : " + null);
        rectMode(CENTER);
        for (let i = 0; i < this.trees.length; i++) {
            push();
            if (this.tree_state[i] == SPRAYED) fill(255, 0, 0);
            rect(this.trees[i].x, this.trees[i].y, 20, 20);
            pop();
        }
        drawingContext.setLineDash([5, 5]);
        for (let i = 0; i < this.aisles.length; i++) {
            push();
            if (this.asile_state[i] == SPRAYED) stroke(255, 0, 0);
            let startX = this.aisles[i].spray_point[0].x;
            let startY = this.aisles[i].spray_point[0].y;
            let endX = this.aisles[i].spray_point[this.aisles[i].spray_point.length - 1].x;
            let endY = this.aisles[i].spray_point[this.aisles[i].spray_point.length - 1].y;
            line(startX, startY, endX, endY);
            pop();
        }
        ellipseMode(CENTER);
        for (let i = 0; i < this.aisles.length; i++) {
            for (let j = 0; j < this.aisles[i].spray_point.length; j++) {
                push();
                if (this.get_state(SPRAY_POINT, this.aisles[i].spray_point[j].id) == SPRAYED) fill(255, 0, 0);
                else continue;
                ellipse(this.aisles[i].spray_point[j].x, this.aisles[i].spray_point[j].y, 10, 10);
                pop();
            }
        }
        pop();
    }
}

function setup() {
    createCanvas(900, 900);
    background(200,255,150);

    socket = io.connect('http://localhost:3000');

    // initilization
    deviceCount = 0;
    socket.on('map', set_map);

    // proximity detection
    // socket.on('address', newDrawing);
}

function set_map(map_data) {
    mp = new Map(map_data);
    mp.draw_map();
}