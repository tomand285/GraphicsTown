var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var objTest = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";
    //var group = LoadedOBJFiles["Wolf.obj"].groups["wolf"];
    //var group = LoadedOBJFiles["dragon3d.obj"].groups["DRAGON"];
    var group = LoadedOBJFiles["cube.obj"].groups["cube"];

    //var group = LoadedOBJFiles["falcon3d.obj"].groups["millenium_falcon"];

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
            		var textureTest = gl.createTexture();
            		gl.activeTexture(gl.TEXTURE10);
            		gl.bindTexture(gl.TEXTURE_2D, textureTest);
            		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            		var imageTest = new Image();
            		imageTest.crossOrigin = "anonymous";
            		imageTest.src = LoadedImageFiles["whiteMarble.jpg"];
            		imageTest.onload = function(){
                		//var texture1 = gl.createTexture();
                		gl.activeTexture(gl.TEXTURE10);
                		gl.bindTexture(gl.TEXTURE_2D, textureTest);
                		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTest);
                		gl.generateMipmap(gl.TEXTURE_2D);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                	};
                }
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
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        	if(useTextures){
        		shaderProgram.program.texSamplerTest = gl.getUniformLocation(shaderProgram.program, "texSampler");
            	gl.uniform1i(shaderProgram.program.texSamplerTest, 10);
        	}

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
//grobjects.push(new objTest("testObj",[0,1,5],1) );