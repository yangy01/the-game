// the-game.js
var gl;
var canvas; 
const WALLHEIGHT     = 70.0; // Some playing field parameters
const ARENASIZE      = 1000.0;
var EYEHEIGHT      = 15.0;
const HERO_VP        = 0.625;

const  upx=0.0, upy=1.0, upz=0.0;    // Some LookAt params 

const fov = 60.0;     // Perspective view params 
const near = 1.0;
const far = 10000.0;
var aspect, eyex, eyez;
const width = 1000;       // canvas size 
const height = 625;
const vp1_left = 0;      // Left viewport -- the hero's view 
const vp1_bottom = 0;
// Lighting stuff
var la0  = [ 0.2,0.2,0.2, 1.0 ]; // light 0 ambient intensity 
var ld0  = [ 1.0,1.0,1.0, 1.0 ]; // light 0 diffuse intensity 
var ls0  = [ 1.0,1.0,1.0, 1.0 ]; // light 0 specular 
var lp0  = [ 0.0,1.0,1.0, 1.0 ]; // light 0 position -- will adjust to hero's viewpoint 
var ma   = [ 0.02 , 0.2  , 0.02 , 1.0 ]; // material ambient 
var md   = [ 0.08, 0.6 , 0.08, 1.0 ]; // material diffuse 
var ms   = [ 0.6  , 0.7, 0.6  , 1.0 ]; // material specular 
var me      = 75;             // shininess exponent 
const red  = [ 1.0,0.0,0.0, 1.0 ]; // pure red 
const blue = [ 0.0,0.0,1.0, 1.0 ]; // pure blue 
const green = [ 0.0,1.0,0.0, 1.0 ]; // pure blue 
const yellow = [ 1.0,1.0,0.0, 1.0 ]; // pure yellow


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var program;

var arena;
var hero;
var thingSeeking;
var villain;
var maze;
var slender;

var g_matrixStack = []; // Stack for storing a matrix


var heroXis = 0;
var heroZis = 0;
var heroWin = false;

var stuck = false;
var stuckS = false;
var item = false;
var increX = 70;
var increZ = -240;
var swtch = 0;

var set = 0;
var counter = 0;
var villWin = false;

var villXis = 70;
var villZis = -240;
var vXis = 70;
var vZis = -240;
var trgr = false;
var trgr2 = false;
var temp = 0;
var temp2 = 0;
var num = 1;
var goingUp = false;

function startnextRound() {
    var villScore = document.getElementById("villainScore");
    var number = villScore.innerHTML;
    number++;
    villScore.innerHTML = number;
    set = 0;
    hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
    hero.init();
    hero.show();
    villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
    item = true;
    villain.init();
    villain.show();
    arena = new Arena(program);
    arena.init();
    hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
    hero.init();
    thingSeeking = new ThingSeeking(program, 850, 0.0, -900, 0, 10.0);
    thingSeeking.init();
    villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
    villain.init();
    maze = new Maze(program, ARENASIZE/4.0, 0.0, -ARENASIZE/4.0, 0, 10.0);
    maze.init();
    heroXis = 0;
    heroZis = 0;
    stuck = false;
    stuckS = false;
    item = false;
    increX = 70;
    increZ = -240;
    swtch = 0;
    set = 0;
    villWin = false;
    villXis = 70;
    villZis = -240;
    goingUp = false;
}

function startnextRoundHero() {
    var heroScore = document.getElementById("heroScore");
    var number = heroScore.innerHTML;
    number++;
    heroScore.innerHTML = number;
    set = 0;
    hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
    hero.init();
    hero.show();
    villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
    item = true;
    villain.init();
    villain.show();
    arena = new Arena(program);
    arena.init();
    hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
    hero.init();
    thingSeeking = new ThingSeeking(program, 850, 0.0, -900, 0, 10.0);
    thingSeeking.init();
    villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
    villain.init();
    maze = new Maze(program, ARENASIZE/4.0, 0.0, -ARENASIZE/4.0, 0, 10.0);
    maze.init();
    heroXis = 0;
    heroZis = 0;
    stuck = false;
    stuckS = false;
    item = false;
    increX = 70;
    increZ = -240;
    swtch = 0;
    set = 0;
    villWin = false;
    villXis = 70;
    villZis = -240;
    goingUp = false;
}


window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
    
    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    eyex  = ARENASIZE/2.0;	// Where the hero starts
    eyez  =  -ARENASIZE/2.0;
    aspect= width/height;

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
		 0); // Assume no texturing is the default used in
                     // shader.  If your game object uses it, be sure
                     // to switch it back to 0 for consistency with
                     // those objects that use the defalt.
    
    
    arena = new Arena(program);
    arena.init();

    hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
    hero.init();
    slenderMan = new slender(program, 70, 0.0, -240, 0, 10.0);
    slenderMan.init();
    thingSeeking = new ThingSeeking(program, 850, 0.0, -900, 0, 10.0);
    thingSeeking.init();

    villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
    villain.init();

    maze = new Maze(program, ARENASIZE/4.0, 0.0, -ARENASIZE/4.0, 0, 10.0);
    maze.init();


    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    // Hero's eye viewport 
    gl.viewport( vp1_left, vp1_bottom, (HERO_VP * width), height );
    if(goingUp == true){
        EYEHEIGHT = EYEHEIGHT +.25;
        console.log(EYEHEIGHT)
        if(EYEHEIGHT >35) {
            goingUp = false;
        }
    } 
    if(goingUp == false && EYEHEIGHT > 15){
        EYEHEIGHT = EYEHEIGHT -.25;
    }
    lp0[0] = hero.x + hero.xdir; // Light in front of hero, in line with hero's direction
    lp0[1] = EYEHEIGHT;
    lp0[2] = hero.z + hero.zdir;

    modelViewMatrix = lookAt( vec3(hero.x, EYEHEIGHT, hero.z),
			      vec3(hero.x + hero.xdir, EYEHEIGHT, hero.z + hero.zdir),
			      vec3(upx, upy, upz) );
    projectionMatrix = perspective( fov, HERO_VP * aspect, near, far );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    arena.show();
    hero.show();
    thingSeeking.show();
    villain.show();
    maze.show();
    slenderMan.show();
    
    // Overhead viewport 
    var horiz_offset = (width * (1.0 - HERO_VP) / 20.0);
    gl.viewport( vp1_left + (HERO_VP * width) + horiz_offset ,
		 vp1_bottom, 18 * horiz_offset, height ); /// the other window on the right 
    modelViewMatrix = lookAt(  vec3(500.0,100.0,-500.0),
			       vec3(500.0,0.0,-500.0),
			       vec3(0.0,0.0,-1.0) );
    projectionMatrix = ortho( -500,500, -500,500, 0,200 );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    arena.show();
    hero.show();
    thingSeeking.show();
    villain.show();
    maze.show();
    villMovement();

    requestAnimFrame( render );
};

// Key listener

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    //villMovement();
    switch (key) {
    case 'S':
    // Move backward
    mapMovement(key);
	break;
    case 'W':
    // Move forward
    mapMovement(key);
    //}
    break;
    case 'D':
    // Turn left
    hero.turn(90);
	break;
    case 'A':
    // Turn right 
    hero.turn(-90);
	break;
    case " ":
    goingUp = true;
    }
    
    
};

function mapMovement(key) { 
    heroXis = lp0[0];
    heroZis = lp0[2];
    
    var itemXis = 850;
    var itemZis = -905;
    
    if(key == 'W'){
        if(heroZis >= (-895) || heroZis <= (-905) && 
           heroXis <= (795) || heroXis >= (805) ){
            hero.move(10);
        } else {
            heroWin = true;
            if(heroWin) {
                heroWin = false;
                var heroScore = document.getElementById("heroScore");
                if(heroScore.innerHTML < 2) {   
                    startnextRoundHero();
                } else {
                    heroScore.innerHTML = 3;
                    thingSeeking = new ThingSeeking(program, 1.0, 0.0, 1.0, 0.0, 10.0);
                    thingSeeking.init();
                    thingSeeking.show();
                    item = true;
                    hero.move(10);
                }
            }
        }
        if(stuckS == true){
            hero.move(10);
            stuckS = false;
        } else if(heroZis < 0 && heroZis > -85 && heroXis < 505 || heroZis > (-85 - 79) && heroXis < 146){//bottom left block movement
            stuck = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -476 && heroXis < 146){//block on the left side
            stuck = true;
            hero.move(0);
        } else if(heroZis < -476 && heroZis > -549 && heroXis < 73){//block on the left side
            stuck = true;
            hero.move(0);
        } else if(heroZis < -545 && heroZis > -1000 && heroXis < 146){//block on the left side
            stuck = true;
            hero.move(0);
        } else if(heroZis < -859 && heroZis > -1000 && heroXis > 282 && heroXis < 647){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -785 && heroZis > -859 && heroXis > 422 && heroXis < 647){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis > -788 && heroXis > 282 && heroXis < 647){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis > -859 && heroXis > 717 && heroXis < 1000){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -704 && heroXis > 925 && heroXis < 1000){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis < -938 && heroXis > 647){//top block
            stuck = true;
            hero.move(0);
        } else if(heroZis < -549 && heroZis > -622 && heroXis > 213 && heroXis < 858){//top middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -549 && heroXis > 785 && heroXis < 858){//top middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -394 && heroXis > 785 && heroXis < 1000){//top middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -237 && heroZis > -310 && heroXis > 927 && heroXis < 1000){//top middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -85 && heroZis > -159 && heroXis > 568 && heroXis < 1000){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -85 && heroZis > -392 && heroXis > 568 && heroXis < 646){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -392 && heroZis > -474 && heroXis > 568 && heroXis < 715){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -392 && heroZis > -474 && heroXis > 213 && heroXis < 715){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -159 && heroZis > -392 && heroXis > 213 && heroXis < 290){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -159 && heroZis > -237 && heroXis > 290 && heroXis < 501){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroZis < -237 && heroZis > -310 && heroXis > 358 && heroXis < 501){//bottom middle
            stuck = true;
            hero.move(0);
        } else if(heroXis <= 0){//left to right.
            if(swtch == 0){
                swtch = 1;
                lp0[0] = 927;
                lp0[2] = -198;
                hero = new Hero(program, lp0[0], 0.0, lp0[2], -135, 10.0);
                hero.init();
                hero.show();
            } else {
                swtch = 0;
                lp0[0] = 930;
                lp0[2] = -530;
                hero = new Hero(program, lp0[0], 0.0, lp0[2], -180, 10.0);
                hero.init();
                hero.show();
            }
        }  else if(heroXis >= 1000){//right to left.
            lp0[0] = 30;
            lp0[2] = -240;
            hero = new Hero(program, lp0[0], 0.0, lp0[2], 0, 10.0);
            hero.init();
            hero.show();
        } else if(heroZis >= 0){//bottom to top.
            lp0[0] = 214;
            lp0[2] = -950;
            hero = new Hero(program, lp0[0], 0.0, lp0[2], -260, 10.0);
            hero.init();
            hero.show();
        } else if(heroZis <= -1000){//top to bottom.
            lp0[0] = 750;
            lp0[2] = -30;
            hero = new Hero(program, lp0[0], 0.0, lp0[2], -900, 10.0);
            hero.init();
            hero.show();
        } 
         else {
            hero.move(10);
        }
    } 
    if(key == 'S'){
        if(heroZis >= (-895) || heroZis <= (-905) && 
           heroXis <= (795) || heroXis >= (805) ){
            hero.move(-5);
        } else {
            heroWin = true;
            if(heroWin) {
                heroWin = false;
                var heroScore = document.getElementById("heroScore");
                if(heroScore.innerHTML < 2) {   
                    startnextRoundHero();
                } else {
                    heroScore.innerHTML = 3;
                    thingSeeking = new ThingSeeking(program, 1.0, 0.0, 1.0, 0.0, 10.0);
                    thingSeeking.init();
                    thingSeeking.show();
                    item = true;
                    hero.move(-5);
                }
            }
        }
        if(stuck == true){
            hero.move(-5);
            stuck = false;
        } else if(heroZis < 0 && heroZis > -85 && heroXis < 505 || heroZis > (-85 - 79) && heroXis < 146){//bottom left block movement
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -476 && heroXis < 146){//block on the left side
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -476 && heroZis > -549 && heroXis < 73){//block on the left side
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -545 && heroZis > -1000 && heroXis < 146){//block on the left side
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -859 && heroZis > -1000 && heroXis > 282 && heroXis < 647){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -785 && heroZis > -859 && heroXis > 422 && heroXis < 647){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis > -788 && heroXis > 282 && heroXis < 647){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis > -859 && heroXis > 717 && heroXis < 1000){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -704 && heroXis > 925 && heroXis < 1000){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -704 && heroZis < -938 && heroXis > 647){//top block
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -549 && heroZis > -622 && heroXis > 213 && heroXis < 858){//top middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -549 && heroXis > 785 && heroXis < 858){//top middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -310 && heroZis > -394 && heroXis > 785 && heroXis < 1000){//top middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -237 && heroZis > -310 && heroXis > 927 && heroXis < 1000){//top middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -85 && heroZis > -159 && heroXis > 568 && heroXis < 1000){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -85 && heroZis > -392 && heroXis > 568 && heroXis < 646){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -392 && heroZis > -474 && heroXis > 568 && heroXis < 715){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -392 && heroZis > -474 && heroXis > 213 && heroXis < 715){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -159 && heroZis > -392 && heroXis > 213 && heroXis < 290){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -159 && heroZis > -237 && heroXis > 290 && heroXis < 501){//bottom middle
            stuckS = true;
            hero.move(0);
        } else if(heroZis < -237 && heroZis > -310 && heroXis > 358 && heroXis < 501){//bottom middle
            stuckS = true;
            hero.move(0);
        } else {
            hero.move(-5);
            
        }
    }
    
    
}

function villMovement(){
    var num = .5;
    console.log("cheese")
    if(item == false){
        if(villXis == 180 && set == 0){ 
            villain.turn(-90);
            set = 1;
        } else if(villZis > -670 && set == 1){
            villain.move(num);
            increZ += -num;
            villZis = increZ;
            if(heroZis == (villZis+2) || heroZis == (villZis-2) && 
                heroXis == (villXis-2) || heroXis == (villXis+2) ){
                set = 0;
                hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
                hero.init();
                hero.show();
                villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
                villain.init();
                villain.show();
            }
        }else if(villZis == -670 && set == 1){
            villain.turn(90);        
            set = 2;
        } else if(villXis < 680 && set == 2){
            villain.move(num);
            increX += num;
            villXis = increX;
            if(heroZis == (villZis+2) || heroZis == (villZis-2) && 
                heroXis == (villXis-2) || heroXis == (villXis+2) ){
                set = 0;
                hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
                hero.init();
                hero.show();
                villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
                villain.init();
                villain.show();
            }
        } else if(villXis == 680 && set == 2){
            villain.turn(-90);        
            set = 3;
        } else if(villZis > -900 && set == 3){
            villain.move(num);
            increZ += -num;
            villZis = increZ;
            if(heroZis == (villZis+2) || heroZis == (villZis-2) && 
                heroXis == (villXis-2) || heroXis == (villXis+2) ){
                set = 0;
                hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
                hero.init();
                hero.show();
                villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
                villain.init();
                villain.show();
            }
        } else if(villZis == -900 && set == 3){
            villain.turn(90);        
            set = 4;
        } else if(villXis < 850 && set == 4){
            villain.move(num);
            increX += num;
            villXis = increX;
            if(heroZis == (villZis+2) || heroZis == (villZis-2) && 
                heroXis == (villXis-2) || heroXis == (villXis+2) ){
                set = 0;
                hero = new Hero(program, eyex, 0.0, eyez-30, -180, 10.0);
                hero.init();
                hero.show();
                villain = new Villain(program, 70, 0.0, -240, 0, 10.0);
                villain.init();
                villain.show();
            }
        } else if(villXis == 850){
            villWin = true;
            villain.move(0);

            if(villWin) {
                var villScore = document.getElementById("villainScore");
                if(villScore.innerHTML < 2) {   
                startnextRound();
                } else {
                    (function r() {
                      setTimeout(r, Math.random() * 10);
                      let el = document.createElement(`div`);
                      el.innerHTML = "<img src='./darcy128.png'></img>";
                      el.style.position = `absolute`;
                      el.style.zIndex = 999999;
                      el.style.fontSize = (((Math.random() * 48) | 0) + 16) + `px`;
                      el.style.left = ((Math.random() * innerWidth) | 0) + `px`;
                      el.style.top = ((Math.random() * (innerHeight + pageYOffset)) | 0) + `px`;
                      document.body.appendChild(el);
                    })();

                }
            }

        } else if(villXis < 180){
            villain.move(num);
            increX += num;
            villXis = increX;
        }

    }
} 

function villRuns(){
    if(heroZis == (villZis+2) || heroZis == (villZis-2) && 
       heroXis == (villXis-2) || heroXis == (villXis+2) ){
        document.write("YOU WIN!");
    } else 
        if(villZis == -900 && temp2 == 0){
            villain.turn(180);
            temp2 = 1;
        } else if(villZis == -900 && villXis > 680){
            villain.move(num);
            increX += -num;
            villXis = increX;
        } else if(villXis == 680 && temp2 == 1){
            villain.turn(-90);
            trgr2 = true;
            temp2 = 2;
        } else if(villXis == 680 && villZis < -670 && trgr2 == false && temp == 0){
            villain.turn(180);
            trgr2 = true;
            temp = 1;
        } else if(villXis == 680 && villZis < -670 && counter == 0 && trgr2 == true){
            villain.move(num);
            increZ += num; 
            villZis = increZ;
        } else if(villZis == -670 && counter == 0 && trgr == false){
            if(trgr2 == true){
                villain.turn(90);
                trgr2 = false;
            } else {
                villain.turn(-180);
            }
            counter = 5; 
            trgr = true;
        }  else if(villXis == 180 && counter == 0){
            villain.turn(-180);  
            trgr = true;
            counter = 1;
        } else if(villZis < -240 && counter == 1){
            villain.move(num);
            increZ += num;
            villZis = increZ;
            temp = 3;
            counter = 1;
        } else if(villZis == -240 && counter == 1){
            villain.turn(90);  ///
            counter = 2;
        } else if(villXis > 0 && counter == 2){
            villain.move(num);
            increX += -num;
            villXis = increX;
        } else if(villXis == 0 && counter == 2){
            if(comSwtch == 0){ // 1
                comSwtch = 1;
                counter = 3;
                villXis = 930;
                increX = villXis;
                villZis = -200;
                increZ = villZis;
                villain = new Villain(program, villXis, 0.0, villZis , 180, 10.0);
                villain.init();
                villain.show();
            } else { // 2
                comSwtch = 2;
                counter = 3;
                villXis = 930;
                increX = villXis;
                villZis = -550;
                increZ = villZis;
                villain = new Villain(program, villXis, 0.0, villZis, -90, 10.0);
                villain.init();
                villain.show();
            }
        } else if(comSwtch == 2 && villZis > -670){
            villain.move(num);
            increZ += -num;
            villZis = increZ;
        } else if(villZis == -670 && comSwtch == 2 && counter == 3){
            villain.turn(-90); 
            counter = 4;
        } else if(villXis > 180 && counter == 4 && comSwtch == 2){ 
            villain.move(num);
            increX += -num;
            villXis = increX;
        } else if(counter == 4 && villXis == 180 && comSwtch == 2){
            comSwtch = 0;
            villain.turn(90); 
            counter = 0;
        } else if(comSwtch == 1 && villXis > 750){
            villain.move(num);
            increX -= num;
            villXis = increX;
        } else if(counter == 3 && villXis == 750){
            villain.turn(90);
            counter = 4;
        } else if(villZis > -510 && counter == 4){
            villain.move(num);
            increZ += -num;
            villZis = increZ;
        } else if(counter == 4 && villZis == -510){
            villain.turn(-90); 
            counter = 5;
        } else if(villXis > 180 && counter == 5){
            villain.move(num);
            increX += -num;
            villXis = increX;
        } else if(counter == 5 && villXis == 180){
            villain.turn(90); 
            counter = 0;
        }
}
