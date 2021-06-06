let img;
function preload() {
    img = loadImage('picture/farm2.png');
}

let pos;
function setup() {
    createCanvas(1900, 1000);
    rectMode(CENTER);
    frameRate(30);

    tint(255.0, 240)
    push();
    scale(1.8);
    image(img, 0, 0);
    pop();
    drawRect();

    pos = 0;

}

function drawRect() {
    for (let j = 0; j < 14; j++) {
        for (let i = 0; i < 28; i++) {
            push();
            if (j < 8 || j >= 8 && j < 10 &&  i < pos) fill(255, 110, 0);
            rect(160+(25.5*i), 190+(40*j), 12, 12);
            pop();
        }
    }
}

function drawCircle() {
    push();
    fill(0, 0, 255);
    circle(160+(25.5*(pos-1)), 530, 12);
    pop();
}

function reDraw() {
    background(255);
    tint(255.0, 240);
    push();
    scale(1.8);
    image(img, 0, 0);
    pop();
    pos++;
    drawRect();
    drawCircle();
}

let sec = 45;
function draw() {
    if (frameCount % sec == 0) {
        reDraw();
    }
}