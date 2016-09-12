

var locations =[];
var velocities = [];
var amount = 50;
var coll = [];
var sizes = [];
var colors = [];
var ms = 0;
var gap = 0;
var speed = 1.5;


function setup() {
  createCanvas(800,600);
  frameRate(30);
  noStroke();

  for(var i = 0; i<amount; i++) {
    var size = random(5,200);
    sizes.push(size);
    var x = random(size/2, width - size/2);
    var y = random(size/2,height - size/2);

    var x = width/2 + random(-100, 100);
    var y = height/2 +random(-100, 100);

    locations.push(createVector(x,y));
    velocities.push(createVector(0,0));
    coll.push(false);
    colors.push(0);
  }
  background(0);
}

function draw() {


  var done = true;
  background(0);

  fill(0,100,255,100);
  stroke(255);
  ellipse(width/2, height/2, min(width, height));
  noStroke();

  for(var i = 0; i<amount; i++) {
    coll[i] = false;
    velocities[i].x = 0;
    velocities[i].y = 0;
  }
  for(i = 0; i<amount; i++) {
    var location = locations[i];
    var R = sizes[i];

    for(var j = i+1; j<amount; j++) {
      var location2 = locations[j];
      var R2 = sizes[j];
      var dir = location.copy().sub(location2);
      var dist = dir.mag();
      dir.normalize();
      var overlap = dist - R/2 - R2/2;

      if(overlap <= gap) {
        done = false;
        coll[i] = true;
        coll[j] = true;
        dir.mult(Math.abs(overlap));
        velocities[i].x += dir.x;
        velocities[i].y += dir.y;
        // dir.mult(-1);
        velocities[j].x -= dir.x;
        velocities[j].y -= dir.y;
      }
    }
  }

  for(i = 0; i<amount; i++) {
    var l = locations[i];
    var velocity = velocities[i];
    velocity.normalize().mult(speed);
    var R = sizes[i];
    // var newpos = createVector(location.x+velocity.x, location.y+velocity.y);
    var newpos = l.copy().add(velocity);
    // if(!( (newpos.x+R/2 > width) || (newpos.x-R/2 < 0) ||  (newpos.y+R/2 > height) || (newpos.y-R/2 < 0) )) {
    //   l.add(velocity);
    // } else if(((newpos.x+R/2 > width) || (newpos.x-R/2 < 0)) && !((newpos.y+R/2 > height) || (newpos.y-R/2 < 0))) {
    //   l.y += velocity.y;
    // } else if(!((newpos.x+R/2 > width) || (newpos.x-R/2 < 0)) && ((newpos.y+R/2 > height) || (newpos.y-R/2 < 0))) {
    //   l.x += velocity.x;
    // }

    var middle = createVector(width/2, height/2);
    var dir = newpos.copy().sub(middle);
    var dist = dir.mag();
    if(dist + (R/2) < min(width/2, height/2)) {
      l.add(velocity);
    }

    if(coll[i]) {
      colors[i] += 15;
    } else {
      colors[i] -= 3;
    }
    colors[i] = max(0, min(255, colors[i]));
    fill(255, 255-colors[i], 255 - colors[i], 255 - colors[i]/255 * 150);

    if(createVector(mouseX, mouseY).sub(l).mag() < R/2)
      fill(100, 150, 50);
    ellipse(l.x,l.y,R,R);

    // fill(0,255,0);
    // textSize(20);
    // text(velocity.x + " : " + velocity.y, l.x, l.y);
  }

  if(!done) {
    for(i = 0; i<amount; i++) {
      sizes[i] *= 0.996;
    }
  }
  if(millis() - ms > 1500 && !done) {
    for(i = 0; i<amount; i++) {
      //sizes[i] *= 0.9;
    }
    ms = millis();
  }
  fill(255);
  text(frameRate(), 15, 30);
}



