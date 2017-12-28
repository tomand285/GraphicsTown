/*
    This "object" is a Cylinder that can easly change it's position and shape with different args.
    It is based off of Cylinder.js in the ExampleObjects folder.
*/
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cone = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Cones - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Cones
    /*
        rh is a 2 element array that holds the radius and height of the Cone
    */
    Cone = function Cone(name, position, rh, color) {
        this.name = name;       
        rh = rh || [1.0,1.0];
        this.radius = rh[0];
        this.height = rh[1];       
        this.position = position || [0,this.height/2];
        this.color = color || [.7,.8,.9];
    }

    function createConeVertices(r,h,rs){
        var vpos = [];        
        var vTextCoord = [];
        var vnormal = [];

        for(var i=0;i<rs;i++){ //push circle bottom
            var xCurr = r*Math.cos(i*2*Math.PI/rs);
            var zCurr = r*Math.sin(i*2*Math.PI/rs);

            var xNext = r*Math.cos((i+1)*2*Math.PI/rs);
            var zNext = r*Math.sin((i+1)*2*Math.PI/rs);

            var calcNormTmp;


            vpos.push(0,0,0); //push center bottom
            vpos.push(xCurr,0, zCurr); 
            vpos.push(xNext,0, zNext); 
            calcNormTmp = calcNormal([0,0,0],[xCurr,0, zCurr],[xNext,0, zNext]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vTextCoord.push((i/rs)*2,2,((i+1)/rs)*2,2,0,0);
        
            //push cylinder sides
            vpos.push(xCurr,0, zCurr); 
            vpos.push(xNext,0, zNext);
            vpos.push(0,h, 0); 
            calcNormTmp = calcNormal([xCurr,0, zCurr],[xNext,0, zNext],[0,h, 0]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);            
            vTextCoord.push((i/rs)*2,2,((i+1)/rs)*2,2,0,0);

        }
        return [vpos,vTextCoord,vnormal];
    }
    Cone.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Cones
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["default-vs", "default-fs"]);
        }
        if (!buffers) {
            var cyl = createConeVertices(1,1,64);
            var arrays = {
                vpos : { numComponents: 3, data: cyl[0]},
                vtex : {numComponents: 2, data: cyl[1]},
                vnormal : {numComponents:3, data: cyl[2]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var texture3 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, texture3);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var image3 = new Image();
            image3.crossOrigin = "anonymous";
            image3.src = LoadedImageFiles["myTexture.png"];
            image3.onload = function(){
                //var texture1 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, texture3);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            };
        }

    };
    Cone.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Cone in the world
        var modelM = twgl.m4.scaling([this.radius,this.height,this.radius]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });

        shaderProgram.program.texSampler3 = gl.getUniformLocation(shaderProgram.program, "texSampler");
            gl.uniform1i(shaderProgram.program.texSampler3, 2);

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Cone.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
/*
    The y-value for position should be half the height to be on the ground
    name, pos, rh
*/
//tree tops
for(var i=-4;i<=4;i++){
    grobjects.push(new Cone("ConeRight"+i,[4,Math.abs(i)%2 +1,i], [0.5,1], rgb(77,158,58)));
    grobjects.push(new Cone("ConeRight"+i+".5",[4,Math.abs(i)%2 +1.5,i], [0.5,1], rgb(77,158,58)));

    grobjects.push(new Cone("ConeLeft"+i,[-4,Math.abs(i)%2 +1,i], [0.5,1], rgb(77,158,58)));
    grobjects.push(new Cone("ConeLeft"+i+".5",[-4,Math.abs(i)%2 +1.5,i], [0.5,1], rgb(77,158,58)));
}
