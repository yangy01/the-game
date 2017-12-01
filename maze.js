////---MAZE----////

function Maze(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);
    
        this.mazeVertices = vwMaze.vertices[0].values;
    
        this.mazeNormals = vwMaze.vertices[0].values;
    
        this.mazeIndices = vwMaze.connectivity[0].indices;
    
        this.vBuffer = null;
        this.nBuffer = null;
        this.iBuffer = null;
        this.vPosition = null;
        this.vNormal = null;
    };
    
    Maze.prototype = Object.create(GameObject.prototype);
    
    Maze.prototype.init = function() {
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.mazeVertices), gl.STATIC_DRAW );
    
        this.nBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.mazeNormals), gl.STATIC_DRAW );
    
        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mazeIndices), gl.STATIC_DRAW);
        
    };
    
    Maze.prototype.show = function() {
    
        g_matrixStack.push(modelViewMatrix);
        modelViewMatrix = mult(modelViewMatrix, translate(this.x+250, 0.0, this.z-300));
        modelViewMatrix = mult(modelViewMatrix, scalem(73.0,73.0,78.0));
    
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        this.vPosition = gl.getAttribLocation( program, "vPosition" );
        if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
        }
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray( this.vPosition );    
    
        gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
        this.vNormal = gl.getAttribLocation( program, "vNormal" );
        if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
        }
        gl.vertexAttribPointer( this.vNormal, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( this.vNormal );
    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );
    
        var ambientProduct = mult(la0, red);
        var diffuseProduct = mult(ld0, red);
        var specularProduct = mult(ls0, red);
        
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                  flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                  flatten(diffuseProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
                  flatten(specularProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
                  flatten(lp0) );
        gl.uniform1f(gl.getUniformLocation(program, "shininess"),
                 me);
    
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.drawElements( gl.TRIANGLES, this.mazeIndices.length, gl.UNSIGNED_SHORT, 0 ); 
        

        modelViewMatrix = g_matrixStack.pop();
        // IMPORTANT: Disable current vertex attribute arrays so those in
        // a different object can be activated
        gl.disableVertexAttribArray(this.vPosition);
        gl.disableVertexAttribArray(this.vNormal);


    
    };
    
    //////////////////////////  End Maze code /////////////////////////////////