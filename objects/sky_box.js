var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var objTest = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for TestobjTests
    objTest = function objTest(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    objTest.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["map-vs", "map-fs"]);
        }
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
                ] },
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

                    //texture from http://www.custommapmakers.org/skyboxes.php with download link http://www.custommapmakers.org/skyboxes/zips/mp_heresy.zip
            	
            		var texture9 = gl.createTexture();
            		gl.activeTexture(gl.TEXTURE8);
            		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture9);
            		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);                    

                    var numLoaded = 0;
                    var skyImages = new Array(6);
                    function finishLoading(){
                        numLoaded++;
                        if(numLoaded == 6){
                            gl.activeTexture(gl.TEXTURE8);
                            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture9);
                            for (var i = 0; i < 6; i++) {
                                gl.texImage2D(skyImages[i].face, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, skyImages[i]);
                            }
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        }
                    }

                    skyImages[0] = new Image();
                    skyImages[0].crossOrigin = "anonymous";
                    skyImages[0].src = LoadedImageFiles["bloody-heresy_ft.jpg"];
                    skyImages[0].face = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
                    skyImages[0].onload = function () { finishLoading();};

                    skyImages[1] = new Image();
                    skyImages[1].crossOrigin = "anonymous";
                    skyImages[1].src = LoadedImageFiles["bloody-heresy_bk.jpg"];
                    skyImages[1].face = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
                    skyImages[1].onload = function () { finishLoading();};

                    skyImages[2] = new Image();
                    skyImages[2].crossOrigin = "anonymous";
                    skyImages[2].src = LoadedImageFiles["bloody-heresy_up.jpg"];
                    skyImages[2].face = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
                    skyImages[2].onload = function () { finishLoading();};

                    skyImages[3] = new Image();
                    skyImages[3].crossOrigin = "anonymous";
                    skyImages[3].src = LoadedImageFiles["bloody-heresy_dn.jpg"];
                    skyImages[3].face = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
                    skyImages[3].onload = function () { finishLoading();};

                    skyImages[4] = new Image();
                    skyImages[4].crossOrigin = "anonymous";
                    skyImages[4].src = LoadedImageFiles["bloody-heresy_rt.jpg"];
                    skyImages[4].face = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
                    skyImages[4].onload = function () { finishLoading();};

                    skyImages[5] = new Image();
                    skyImages[5].crossOrigin = "anonymous";
                    skyImages[5].src = LoadedImageFiles["bloody-heresy_lf.jpg"];
                    skyImages[5].face = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
                    skyImages[5].onload = function () { finishLoading();};

           }

        };
    objTest.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = twgl.m4.scaling([this.size,this.size,this.size]);
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
            model: modelM 
        });
        	
        		shaderProgram.program.texSampler9 = gl.getUniformLocation(shaderProgram.program, "skymap");
            	gl.uniform1i(shaderProgram.program.texSampler9, 8);
        	

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    objTest.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
var big = 100;
grobjects.push(new objTest("skybox",[0,0,0],big));