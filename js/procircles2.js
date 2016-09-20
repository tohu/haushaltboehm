var amount = 30;
var ms = 0;
var speed = 2;

var circles = [];
var dataread = false;
var containerRadius;

xmlToJson();

function setup() {
  var canvas = createCanvas(1600,850);
  containerRadius = min(width, height);
  canvas.parent('sketch');

  frameRate(60);
  noStroke();

  for(var i = 0; i<amount; i++) {
    var size = random(5,400);
    var x = containerRadius/2 + random(-100, 100);
    var y = containerRadius/2 +random(-100, 100);
    //circles.push(circle(x,y,size/2));
  }
  background(0);
}

function loadData() {
  if(typeof haushaltsdaten !== 'undefined') {
    circles = [];
    var sum = 0;
    haushaltsdaten.children.forEach(function(cur) {
      sum += cur.size;
      var size = cur.size * 0.000005;
      var x = width/2 + random(-100, 100);
      var y = height/2 +random(-100, 100);
      var cc = circle(x,y,size/2);
      circles.push(cc);
    });
    haushaltsdaten.children.forEach(function(cur,idx) {
      var cc = circles[idx];
      cc.text = function(me, txt) {
        return function(){
          if(me.collPoint) {
            fill(0,50,50);
            noStroke();
            text(txt, me.location.x,me.location.y);
            text(txt, 900, 50);
          }
        };
      }(cc, cur.name + " : " + Math.floor(cur.size / sum * 100) + "%  --- " + cur.size / 1000000000 + " Mrd. €");
    });
    dataread = true;
  }
}

function draw() {
  var done = true;
  background(255);
  dataread ? "" : loadData();


  fill(50,150,100);
  noStroke();
  ellipse(containerRadius/2, containerRadius/2, min(width, height));
  noStroke();

  // reset all circles
  for(var i = 0; i<circles.length; i++) {
    // circles[i].collCircle = false;
    // circles[i].setVelocity(0,0);
    circles[i].reset();
  }

  // Collide all circles with each other
  for(i = 0; i<circles.length; i++) {
    var circle1 = circles[i];

    for(var j = i+1; j<circles.length; j++) {
      var circle2 = circles[j];
      var coll = circle1.collideCircle(circle2);
      if(coll) {
        done = false;
      }
    }
  }

  // move and draw all circles
  for(i = 0; i<circles.length; i++) {
    var cc = circles[i];
    // cc.move(speed);

    // border collision
    var newloc = cc.phantomMove(speed);
    var middle = createVector(containerRadius/2, containerRadius/2);
    var dir = newloc.copy().sub(middle);
    var dist = dir.mag();

    if(dist + (cc.radius) > containerRadius/2) {
      var acc = middle.copy().sub(cc.location);
      cc.acc = acc;
      done = false;
      cc.move(speed*2);
    } else {
      cc.move(speed);
    }


    cc.collidePoint(mouseX, mouseY);
    if(cc.collidePoint(mouseX, mouseY))
      fill(100, 150, 50);
    cc.draw();

    // fill(0,255,0);
    // textSize(20);
    // text(velocity.x + " : " + velocity.y, l.x, l.y);
  }
  circles.forEach(function(cur) {
    if(cur.text)
      cur.text();
  });

  if(!done) {
    for(i = 0; i<circles.length; i++) {
      circles[i].scaleArea(0.996);
    }
  }
  if(millis() - ms > 1500 && !done) {
    for(i = 0; i<circles.length; i++) {
      //sizes[i] *= 0.9;
    }
    ms = millis();
  }
  fill(255);
  text(frameRate(), 15, 30);
}



