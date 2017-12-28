//A helper file to hold functions for all my objects

//takes the RGB values of a object and normalizes it
function rgb(r,g,b){
	return [r/255,g/255,b/255];
}

//normalizes the given array
function normalize(vec){
	var sqVec = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
	var norm;
	if(sqVec != 0)
		norm = [vec[0]/sqVec,vec[1]/sqVec,vec[2]/sqVec];
	else
		norm = [0,0,0];

	return norm;
}

function calcNormal(p1,p2,p3){
	var U = [p1[0]-p2[0],p1[1]-p2[1],p1[2]-p2[2]];
	var V = [p3[0]-p1[0],p3[1]-p1[1],p3[2]-p1[2]];

	var Nx = U[1]*V[2] - U[2]*V[1];
	var Ny = U[2]*V[0] - U[0]*V[2];
	var Nz = U[0]*V[1] - U[1]*V[0];

	return normalize([Nx,Ny,Nz]);

}