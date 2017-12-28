/*
    This "object" is a wall that can easly change it's position and shape with different args.
    It is based off of Sphere.js in the ExampleObjects folder.
*/
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Sphere = undefined;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Spheres - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Spheres
    /*
        lhw is a 3 element array that holds the length, height, and the width of the wall
    */
    Sphere = function Sphere(name, position, r, lon, lat, color) {
        this.name = name;
        this.radius = r || 1.0;        
        this.position = position || [0,this.radius,0];
        this.lat = lat || 24;
        this.lon = lon || 24;
        this.color = color || rgb(83,49,24);
    }

    function createSphereVertices(r,lon,lat){
        var vpos = [];
        var vnormal = [];
        var vTextCoord = [];

       for(var i=0;i<=lat;i++){ //lat
            for(var j=0;j<=lon;j++){ //long
                /*
                1   2
                3   4        
                */
                //1
                var x1 = r*Math.sin(i*Math.PI/lat)*Math.cos(j*2*Math.PI/lon);
                var y1 = r*Math.sin(i*Math.PI/lat)*Math.sin(j*2*Math.PI/lon);
                var z1 = r*Math.cos(i*Math.PI/lat);

                var x2 = r*Math.sin(i*Math.PI/lat)*Math.cos((j+1)*2*Math.PI/lon);
                var y2 = r*Math.sin(i*Math.PI/lat)*Math.sin((j+1)*2*Math.PI/lon);
                var z2 = r*Math.cos(i*Math.PI/lat);

                var x3 = r*Math.sin((i+1)*Math.PI/lat)*Math.cos(j*2*Math.PI/lon);
                var y3 = r*Math.sin((i+1)*Math.PI/lat)*Math.sin(j*2*Math.PI/lon);
                var z3 = r*Math.cos((i+1)*Math.PI/lat);

                var x4 = r*Math.sin((i+1)*Math.PI/lat)*Math.cos((j+1)*2*Math.PI/lon);
                var y4 = r*Math.sin((i+1)*Math.PI/lat)*Math.sin((j+1)*2*Math.PI/lon);
                var z4 = r*Math.cos((i+1)*Math.PI/lat); 

                var calcNormTmp;

                //push cylinder sides
                vpos.push(x1,y1,z1);
                vpos.push(x2,y2,z2); 
                vpos.push(x3,y3,z3); 
                calcNormTmp = calcNormal([x1,y1,z1],[x2,y2,z2],[x3,y3,z3]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vTextCoord.push(0,0,1,0,0,1);

                vpos.push(x2,y2,z2); 
                vpos.push(x4,y4,z4);
                vpos.push(x3,y3,z3); 
                calcNormTmp = calcNormal([x2,y2,z2],[x4,y4,z4],[x3,y3,z3]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
                vTextCoord.push(1,0,1,1,0,1);
            }
        }

        return [vpos,vTextCoord,vnormal];
    }
    Sphere.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Spheres
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["default-vs", "default-fs"]);
        }
        if (!buffers) {
            var sph = createSphereVertices(this.radius,this.lon,this.lat);
            var arrays = {
                vpos : { numComponents: 3, data: sph[0]},
                vtex : {numComponents: 2, data: sph[1]},
                vnormal : {numComponents:3, data: sph[2]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var texture2 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture2);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var image2 = new Image();
            image2.crossOrigin = "anonymous";
            image2.src = LoadedImageFiles["whiteMarble.jpg"];
            image2.onload = function(){
                //var texture1 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture2);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            };
        }

    };
    Sphere.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Sphere in the world
        var modelM = twgl.m4.rotationX(80);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, 
            proj:drawingState.proj, 
            lightdir:drawingState.sunDirection,
            cubecolor:this.color,
             model: modelM });

            shaderProgram.program.texSampler2 = gl.getUniformLocation(shaderProgram.program, "texSampler2");
            gl.uniform1i(shaderProgram.program.texSampler2, 1);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Sphere.prototype.center = function(drawingState) {
        return this.position;
    }
    
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
/*
    The y-value for position should be half the height to be on the ground
    name, pos, r, sides
*/

//grobjects.push(new Sphere("Earth"));

