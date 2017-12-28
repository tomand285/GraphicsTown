var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Dragon = undefined;


// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";
    /*
    Orignal OBJ file from https://www.yobi3d.com/q/3D-model/chinese%20dragon
    */
    var group = LoadedOBJFiles["dragon3d.obj"].groups["DRAGON"];
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


    var useTextures = (texCoords!="")?true:false;

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for TestDragons
    Dragon = function Dragon(name, position, size, color, axis, tilt) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
        this.axis = axis || ['0.5','-0.3','0'];
        this.tilt = tilt || 10;
    }
    Dragon.prototype.init = function(drawingState) {
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
                    var texture7 = gl.createTexture();
                    gl.activeTexture(gl.TEXTURE6);
                    gl.bindTexture(gl.TEXTURE_2D, texture7);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

                    var image7 = new Image();
                    image7.crossOrigin = "anonymous";
                    image7.src = LoadedImageFiles["whiteMarble.jpg"];
                    image7.onload = function(){
                        //var texture1 = gl.createTexture();
                        gl.activeTexture(gl.TEXTURE6);
                        gl.bindTexture(gl.TEXTURE_2D, texture7);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image7);
                        gl.generateMipmap(gl.TEXTURE_2D);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                    };
                }
            }

        };
    Dragon.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var theta = (this.tilt*Math.PI)/180;
        var modelM =  twgl.m4.axisRotation(this.axis, theta);
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
                shaderProgram.program.texSampler7 = gl.getUniformLocation(shaderProgram.program, "texSampler");
                gl.uniform1i(shaderProgram.program.texSampler7, 6);
            }

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Dragon.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Dragon("dragon",[0,3,0.5],0.15));