/*
    This "object" is a wall that can easly change it's position and shape with different args.
    It is based off of Wall.js in the ExampleObjects folder.
*/
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Wall = undefined;
var sWall = undefined;
// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Walls - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Walls
    /*
        lhw is a 3 element array that holds the length, height, and the width of the wall
    */
    Wall = function Wall(name, position, lhw, color) {
        this.name = name;       
        lhw = lhw || [1.0,1.0,1.0];
        this.length = lhw[0];
        this.height = lhw[1];
        this.width = lhw[2];        
        this.position = position || [0,this.height/2,0];
        this.color = color || [.7,.8,.9];
    }
    Wall.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Walls
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["default-vs", "default-fs"]);
        }
        if (!buffers) {
            var stretch = 2;
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
                ] },
                vtex : {numComponents: 2, data:[
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch,
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch, 
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch, 
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch, 
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch, 
                        0,0,    stretch,0,    stretch,stretch,        0,0,    stretch,stretch,    0,stretch,    
                    ]},
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
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
    Wall.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Wall in the world
        var modelM = twgl.m4.scaling([this.length,this.height,this.width]);
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

            shaderProgram.program.texSampler2 = gl.getUniformLocation(shaderProgram.program, "texSampler");
            gl.uniform1i(shaderProgram.program.texSampler2, 1);
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Wall.prototype.center = function(drawingState) {
        return this.position;
    }

    //slanted walls
    sWall = function sWall(name, position, lhw, color, axis, tilt) {
       Wall.apply(this,arguments);
       this.axis = axis || ['1','1','1'];
       this.tilt = tilt || 0;
    }
    sWall.prototype = Object.create(Wall.prototype);
    sWall.prototype.draw = function(drawingState) {
        var theta = (this.tilt*Math.PI)/180;
        var modelM =  twgl.m4.axisRotation(this.axis, theta);
        // we make a model matrix to place the Wall in the world
        twgl.m4.scale(modelM, [this.length,this.height,this.width], modelM);       
        twgl.m4.setTranslation(modelM, this.position, modelM);
                
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

    
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
/*
    The y-value for position should be half the height to be on the ground
    name, pos, lhw
*/

