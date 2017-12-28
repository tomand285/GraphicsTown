var Temple = function Temple(name, position, lhw) {
        this.name = name;       
        lhw = lhw || [1.0,1.0,1.0];
        this.length = lhw[0];
        this.height = lhw[1];
        this.width = lhw[2];     
        this.radius = (this.length+this.width)/2  
        this.position = position || [0,0,0];
        this.color = [.7,.8,.9];
    
        //walls
        grobjects.push(new Wall(this.name+"Floor1",[0*this.length+this.position[0],0.0625*this.height+this.position[1],0*this.width+this.position[2]], [6.25*this.length,0.125*this.height,8*this.width]));
        grobjects.push(new Wall(this.name+"Floor2",[0*this.length+this.position[0],0.1875*this.height+this.position[1],0*this.width+this.position[2]], [6.25*this.length,0.125*this.height,7.75*this.width]));
        grobjects.push(new Wall(this.name+"Floor3",[0*this.length+this.position[0],0.3125*this.height+this.position[1],0*this.width+this.position[2]], [6.25*this.length,0.125*this.height,7.5*this.width]));
        grobjects.push(new Wall(this.name+"Floor4",[0*this.length+this.position[0],0.4375*this.height+this.position[1],0*this.width+this.position[2]], [6.25*this.length,0.125*this.height,7.25*this.width]));
        grobjects.push(new Wall(this.name+"Floor5",[0*this.length+this.position[0],0.5625*this.height+this.position[1],0*this.width+this.position[2]], [6.25*this.length,0.125*this.height,7*this.width]));
        grobjects.push(new Wall(this.name+"WallLeft", [-3.2*this.length+this.position[0],0.375*this.height+this.position[1],0*this.width+this.position[2]],[0.125*this.length,0.75*this.height,8*this.width]));
        grobjects.push(new Wall(this.name+"WallRight", [3.2*this.length+this.position[0],0.375*this.height+this.position[1],0*this.width+this.position[2]],[0.125*this.length,0.75*this.height,8*this.width]));
        grobjects.push(new Wall(this.name+"Ciel",[0*this.length+this.position[0],4.375*this.height+this.position[1],0*this.width+this.position[2]], [6*this.length,0.75*this.height,7*this.width]));
        
        //twall
        grobjects.push(new tWall(this.name+"Front", [0*this.length+this.position[0],5.5*this.height+this.position[1],3.4*this.width+this.position[2]],[6*this.length,1.5*this.height,.05*this.width]));
        grobjects.push(new tWall(this.name+"Back", [0*this.length+this.position[0],5.5*this.height+this.position[1],-3.4*this.width+this.position[2]],[6*this.length,1.5*this.height,.05*this.width]));

        var roofAngle = Math.tan(1.5*this.height/((6*this.length)))*100;

        //swwall
        grobjects.push(new sWall(this.name+"TopLeft",[-1.5*this.length+this.position[0],5.5*this.height+this.position[1],0*this.width+this.position[2]],[3.38*this.length,0.125*this.height,7*this.width],null,[0,0,1],roofAngle));
        grobjects.push(new sWall(this.name+"TopRight",[1.5*this.length+this.position[0],5.5*this.height+this.position[1],0*this.width+this.position[2]],[3.38*this.length,0.125*this.height,7*this.width],null,[0,0,1],-roofAngle));
        //pillers
        grobjects.push(new Cylinder(this.name+"Cylinder2",[-2.5*this.length+this.position[0],0*this.height+this.position[1],-3*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder3",[-2.5*this.length+this.position[0],0*this.height+this.position[1],3*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder4",[-2.5*this.length+this.position[0],0*this.height+this.position[1],-1*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder5",[-2.5*this.length+this.position[0],0*this.height+this.position[1],1*this.width+this.position[2]], [.5*this.radius,4*this.height]));

        grobjects.push(new Cylinder(this.name+"Cylinder2.5",[-2.5*this.length+this.position[0],0*this.height+this.position[1],-3*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder3.5",[-2.5*this.length+this.position[0],0*this.height+this.position[1],3*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder4.5",[-2.5*this.length+this.position[0],0*this.height+this.position[1],-1*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder5.5",[-2.5*this.length+this.position[0],0*this.height+this.position[1],1*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));

        grobjects.push(new Cylinder(this.name+"Cylinder6",[2.5*this.length+this.position[0],0*this.height+this.position[1],-3*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder7",[2.5*this.length+this.position[0],0*this.height+this.position[1],3*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder8",[2.5*this.length+this.position[0],0*this.height+this.position[1],-1*this.width+this.position[2]], [.5*this.radius,4*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder9",[2.5*this.length+this.position[0],0*this.height+this.position[1],1*this.width+this.position[2]], [.5*this.radius,4*this.height]));

        grobjects.push(new Cylinder(this.name+"Cylinder6.5",[2.5*this.length+this.position[0],0*this.height+this.position[1],-3*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder7.5",[2.5*this.length+this.position[0],0*this.height+this.position[1],3*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder8.5",[2.5*this.length+this.position[0],0*this.height+this.position[1],-1*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));
        grobjects.push(new Cylinder(this.name+"Cylinder9.5",[2.5*this.length+this.position[0],0*this.height+this.position[1],1*this.width+this.position[2]], [.6*this.radius,0.8*this.height]));

}

Temple("temple",[0,0,0], [0.5,0.5,0.5]); 

//Temple("temple1",[2,0,2.5], [0.5,0.5,0.5]);  
//Temple("temple2",[-2,0,2.5], [0.5,0.5,0.5]);

//Temple("temple3",[2,0,-2.5], [0.5,0.5,0.5]);  
//Temple("temple4",[-2,0,-2.5], [0.5,0.5,0.5]);

//grobjects.push(new Temple("temple",[0,0,0],[1,1,1]));
