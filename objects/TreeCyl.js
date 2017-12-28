/*
    This "object" is a Tree that can easly change it's position and shape with different args.
    It is based off of Tree.js in the ExampleObjects folder.
*/
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Tree = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all Trees - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Trees
    /*
        rh is a 2 element array that holds the radius and height of the Tree
    */
    Tree = function Tree(name, position, rh, color) {
        this.name = name;       
        rh = rh || [1.0,1.0];
        this.radius = rh[0];
        this.height = rh[1];       
        this.position = position || [0,this.height/2];
        this.color = color || [.7,.8,.9];
    }

    function createTreeVertices(r,h,rs){
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
            vpos.push(xCurr,h, zCurr); 
            vpos.push(xNext,h, zNext); 
            calcNormTmp = calcNormal([xCurr,0, zCurr],[xCurr,h, zCurr],[xNext,h, zNext]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vTextCoord.push((i/rs)*2,2,((i+1)/rs)*2,2,0,0);

            vpos.push(xCurr,0, zCurr); 
            vpos.push(xNext,0, zNext);
            vpos.push(xNext,h, zNext); 
            calcNormTmp = calcNormal([xCurr,0, zCurr],[xNext,0, zNext],[xNext,h, zNext]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vTextCoord.push((i/rs)*2,2,((i+1)/rs)*2,2,0,0);

            //push circle top
            vpos.push(0,h,0); //push center top
            vpos.push(xCurr,h, zCurr);
            vpos.push(xNext,h, zNext); 
            calcNormTmp = calcNormal([0,h,0],[xCurr,h, zCurr],[xNext,h, zNext]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vnormal.push(calcNormTmp[0],calcNormTmp[1],calcNormTmp[2]);
            vTextCoord.push((i/rs)*2,2,((i+1)/rs)*2,2,0,0);
        }
        return [vpos,vTextCoord,vnormal];
    }
    Tree.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all Trees
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["default-vs", "default-fs"]);
        }
        if (!buffers) {
            var cyl = createTreeVertices(1,1,64);
            var arrays = {
                vpos : { numComponents: 3, data: cyl[0]},
                vtex : { numComponents: 2, data: cyl[1]},
                vnormal : {numComponents:3, data: cyl[2]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);

            var texture5 = gl.createTexture();
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, texture5);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var image5 = new Image();
            image5.crossOrigin = "anonymous";
            image5.src = LoadedImageFiles["BarkDecidious.jpg"];
            image5.onload = function(){
                //var texture1 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, texture5);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image5);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            };
        }

    };
    Tree.prototype.draw = function(drawingState) {
        // we make a model matrix to place the Tree in the world
        var modelM = twgl.m4.scaling([this.radius,this.height,this.radius]);
        twgl.m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });

        shaderProgram.program.texSampler5 = gl.getUniformLocation(shaderProgram.program, "texSampler");
            gl.uniform1i(shaderProgram.program.texSampler5, 4);

        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Tree.prototype.center = function(drawingState) {
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
//grobjects.push(new Tree("Tree1",[0,0,0], [.5,4]));

//trees
for(var i=-4;i<=4;i++){
    grobjects.push(new Tree("treeTrunkLeft"+i,[-4,0,i], [.125,2], rgb(83,49,24)));
    grobjects.push(new Tree("treeTrunkRight"+i,[4,0,i], [.125,2], rgb(83,49,24)));
}
