var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Falcon = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";
    /*
    Original OBJ file from https://free3d.com/3d-model/millenium-falcon-82947.html
    */
    var group = LoadedOBJFiles["falcon3d.obj"].groups["millenium_falcon"];

    var faces = group.faces;
    var vertices = group.vertices;
    var normals = group.normals;
    var texCoords = group.texCoords;
    var myVert = [], myNorm = [], myTex = [];

    //face -> vertex,textCoord, normal
    for(var i = 0;i<faces.length;i++){   //for each face
        var face = faces[i];
        for(var n = 0;n < face.length;n++){ //for each vertex
            var indices = face[n];
            myVert.push(vertices[indices[0]][0],vertices[indices[0]][1],vertices[indices[0]][2]);
            if(indices[1] != null)
                myTex.push(texCoords[indices[1]][0],texCoords[indices[1]][1]);
            if(indices[2] != null)
                myNorm.push(normals[indices[2]][0],normals[indices[2]][1],normals[indices[2]][2]);
            else{
                var calcNormTmp = calcNormal(vertices[face[0][0]],vertices[face[1][0]],vertices[face[2][0]]);
                myNorm.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);  
            }
        }

    }
    //alert(h);
    var useTextures = false; //(texCoords!="")?true:false;

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for TestFalcons
    Falcon = function Falcon(name, position, size, color, axisX, axisY, axisZ) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
        this.state = 0;
        this.axisX = axisX || 0;
        this.axisY = axisY || 0;
        this.axisZ = axisZ || 0;
    }
    Falcon.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
        	if(!useTextures)
               shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
           else
               shaderProgram = twgl.createProgramInfo(gl, ["default-vs", "default-fs"]);
       }
       if (!buffers) {
           if (!shaderProgram)
               var arrays = {
                   vpos : { numComponents: 3, data: myVert },
                   vnormal : {numComponents:3, data: myNorm}
               };
               else
                  var arrays = {
                   vpos : { numComponents: 3, data: myVert },
                   vtex : {numComponents: 2, data: myTex},
                   vnormal : {numComponents:3, data: myNorm}
               };
               buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

               if(useTextures){
                  var texture8 = gl.createTexture();
                  gl.activeTexture(gl.TEXTURE7);
                  gl.bindTexture(gl.TEXTURE_2D, texture8);
                  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

                  var image8 = new Image();
                  image8.crossOrigin = "anonymous";
                  image8.src = LoadedImageFiles["whiteMarble.jpg"];
                  image8.onload = function(){
                		//var texture1 = gl.createTexture();
                		gl.activeTexture(gl.TEXTURE7);
                		gl.bindTexture(gl.TEXTURE_2D, texture8);
                		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image8);
                		gl.generateMipmap(gl.TEXTURE_2D);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                	};
                }
            }
            //Falcon behavior stuff
            this.wait = getRandomInt(250,750);
            this.lastTime = 0;

        };
        Falcon.prototype.draw = function(drawingState) {
        //Falcon's movement
        advance(this,drawingState);

        // we make a model matrix to place the cube in the world
        var thetaX = (this.axisX*Math.PI)/180;
        var thetaY = (this.axisY*Math.PI)/180;
        var thetaZ = (this.axisZ*Math.PI)/180;

        var modelM =  twgl.m4.rotationX(thetaX);
        twgl.m4.rotateY(modelM,thetaY,modelM);
        twgl.m4.rotateZ(modelM,thetaZ,modelM);
        twgl.m4.scale(modelM, [this.size,this.size,this.size], modelM);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        if(useTextures){
          shaderProgram.program.texSampler8 = gl.getUniformLocation(shaderProgram.program, "texSampler");
          gl.uniform1i(shaderProgram.program.texSampler8, 7);
      }

      twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
  };
  Falcon.prototype.center = function(drawingState) {
    return this.position;
}

    ///////////////////////////////////////////////////////////////////
    // Falcon Behavior
    //
    // the guts of this (the "advance" function) probably could
    // have been a method of shipcopter.
    //
    // this is all kept separate from the parts that draw the shipcopter
    //
    // the idea is that
    // the shipcopter starts on a shippad,
    // waits some random amount of time,
    // takes off (raises to altitude),
    // picks a random shippad to fly to,
    // turns towards that shippad,
    // flies to that shippad,
    // lands
    //
    ////////////////////////
    // constants
    var altitude = 3;
    var verticalSpeed = 3 / 1000;      // units per milli-second
    var flyingSpeed = 3/1000;          // units per milli-second
    var turningSpeed = 2/1000;         // radians per milli-second

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    var Bezier = function(t) {
      return [
      (1-t)*(1-t)*(1-t),
      3*t*(1-t)*(1-t),
      3*t*t*(1-t),
      t*t*t
      ];
  }

  var BezierDerivative = function(t) {
      return [
      -3*(1-t)*(1-t),
      3*(1-3*t)*(1-t),
      3*t*(2-3*t),
      3*t*t
      ];
  }
  function Cubic(basis,P,t){
    var b = basis(t);
    var result=twgl.v3.mulScalar(P[0],b[0]);
    twgl.v3.add(twgl.v3.mulScalar(P[1],b[1]),result,result);
    twgl.v3.add(twgl.v3.mulScalar(P[2],b[2]),result,result);
    twgl.v3.add(twgl.v3.mulScalar(P[3],b[3]),result,result);
    return result;
}
function calcU(t,t0,t1){
    return (t-t0)/(t1-t0);
}

  var location = 0;
  var u=0;
  function advance(ship, drawingState){
    var start = 0;
        // on the first call, the copter does nothing
        location += 0.05; //this is my t
        var sections = 2;
        location = location%sections; //must be divisable by 2
        
    var p0=[-5,3,-5];
    var p1=[10,4,0];
    var p2=[10,3,10];
    var p3=[0,4,10];

    p3;
    var p4=[-10,4,-10];
    var p5=[-10,4,0];
    var p6=[-5,3,-5];
    
    var P; // All the control points

        if(location >= 0 && location < 1){
            u = calcU(location,0,1);
            P = [p0,p1,p2,p3];
            start = 1;
            
        }else if(location >= 1 && location < 2){
            u = calcU(location,1,2);
            P = [p3,p4,p5,p6];
            start = 2;
        }

        if(start != 0){
            var path = Cubic(Bezier,P,u);
            ship.position = [
                path[0],
                path[1],
                path[2]
            ];
            var der = Cubic(BezierDerivative,P,u);
            ship.axisX = der[0];
            ship.axisY = der[1]*180/Math.PI;
            ship.axisZ = der[2];


        } 
    }

    })();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Falcon("Falcon",[2.5,3.0,0],0.3));