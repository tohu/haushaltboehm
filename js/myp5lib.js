circle = function(x, y, radius, velocity, colr, margin) {
  var circle = {
    location : createVector(x, y),
    width : width,
    radius : radius,
    velocity : velocity || createVector(0,0),
    colr : colr || 0,
    collCircle : false,
    collPoint : false,
    margin : margin || 0,
    acc : createVector(0,0),
    reset: function() {
      this.acc.x = 0;
      this.acc.y = 0;

      this.collCircle = false;
      this.collPoint = false;
    },
    collideVector: function(otherLocation) {
      var cp = otherLocation.sub(this.location).mag() < this.radius;
      this.collPoint = this.collPoint || cp;
      return cp;
    },
    collidePoint : function(x, y) {
      var cp = (createVector(x, y).sub(this.location).mag() < this.radius);
      this.collPoint = this.collPoint || cp;
      return cp;
    },
    // This will check for collision and modify velocity, color, ...
    collideCircle : function(oc) {
      var dir = this.location.copy().sub(oc.location);
      var dist = dir.mag();
      var overlap = dist - this.radius - oc.radius;
      var coll = (overlap <= this.margin);
      this.collCircle = this.collCircle || coll;
      oc.collCircle = oc.collCircle || coll;

      if(coll) {
        dir.normalize();
        dir.mult(Math.abs(overlap));

        var oldw = 0.1;
        var neww = 0.9;
        var oldacc = this.acc.copy().mult(oldw);
        this.acc = dir.copy().mult(neww).add(oldacc);
        oldacc = oc.acc.copy().mult(oldw);
        oc.acc = dir.copy().mult(-1*neww).add(oldacc);


        // this.acc = this.acc.mult(0.5).add(this.acc.add(dir).mult(0.5));
        // oc.acc.mult(0.5).add(oc.acc.adddir.mult(-1));
      }
      return this.collCircle;
    },
    scaleRadius : function(factor) {
      this.radius *= factor;
    },
    scaleArea : function(factor) {
      this.radius *= Math.sqrt(factor);
    },
    setVelocity : function(x,y) {
      this.velocity.x = x;
      this.velocity.y = y;
    },
    move : function(speed) {
      this.acc.mult(speed);
      if(abs(this.acc.x)>0 || abs(this.acc.y) >0) {
        this.velocity.add(this.acc);
      }
      else {
        this.velocity.mult(0);
      }
      this.location.add(this.velocity);
    },
    phantomMove : function(speed) {
      var cacc = this.acc.copy().mult(speed);
      var cvel = this.velocity.copy();
      if(abs(cacc.x)>0 || abs(cacc.y) >0) {
         cvel.add(cacc);
      }
      else {
        cvel.mult(0);
      }
      return this.location.copy().add(cvel);
    },
    stroke : function() {
      if(this.collPoint) {
        stroke(0, 255, 100);
        strokeWeight(4);
      } else {
        noStroke();
      }
    },
    text : null,
    fill : function() {
      fill(150, 190-this.colr, 190 - this.colr, 255 - this.colr/255 * 50);
    },
    draw : function() {
      if(this.collCircle) {
        this.colr += 15;
      }
      else {
        this.colr -= 3;
      }
      this.colr = max(0, min(255, this.colr));
      this.fill();
      this.stroke();
      ellipse(this.location.x, this.location.y, 2 * this.radius, 2 * this.radius);
    }
  };
  return circle;
};
