var amount = 10;
var ms = 0;
var speed = 2;

var circles = [];


function setup() {
  var canvas = createCanvas(1800,600);
  canvas.parent('sketch');
  frameRate(60);
  noStroke();
  background(0);

  var s = 100;
  var shift = s +5;

  for(var i = amount; i > 0; i--) {
    var size = 0.5 + 0.5* i / amount;
    var cc = circle(shift, s, s);
    cc.scaleArea(size);
    shift += cc.radius*2;


    cc.fill = function(me){
      return function(){fill(0, 255*me.radius/s, 255*me.radius/s);};
    }(cc);
    cc.stroke = function(){stroke(0);strokeWeight(3);};
    circles.push(cc);
  }
  shift = s +5;
  for(var i = amount; i > 0; i--) {
    var size = 0.5 + 0.5* i / amount;
    var cc = circle(shift, 3*s+10, s);
    cc.scaleRadius(size);
    shift += cc.radius*2;


    cc.fill = function(me){
      return function(){fill(0, me.radius/s*255, 255*me.radius/s);};
    }(cc);
    cc.stroke = function(){stroke(0);strokeWeight(3);};
    circles.push(cc);
  }
}

function draw() {
  background(28);
  circles.forEach(function(cur) {
    cur.draw();
  });
}



