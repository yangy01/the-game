//////////////////////////  slender class /////////////////////////////////


function slender(program, x, y, z, degrees, bounding_cir_rad) {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.slenderVertices = slendMesh.vertices[0].values;

    this.slenderNormals = slendMesh.vertices[0].values;

    this.slenderIndices = slendMesh.connectivity[0].indices;

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
};

slender.prototype = Object.create(GameObject.prototype);

slender.prototype.init = function () {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.slenderVertices), gl.STATIC_DRAW);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.slenderNormals), gl.STATIC_DRAW);

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.slenderIndices), gl.STATIC_DRAW);

};

slender.prototype.show = function () {
    gl.enable(gl.DEPTH_TEST);
    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 15.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.05, 0.05, 0.05));
    modelViewMatrix = mult(modelViewMatrix, rotateY(90));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    this.vPosition = gl.getAttribLocation(program, "vPosition");
    if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    this.vNormal = gl.getAttribLocation(program, "vNormal");
    if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);

    var lightPosition = vec4(10.0, 300.0, 10.0, 0.8);
    var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    var materialAmbient = vec4(1.0, 0.5, 0.5, 1.0);

    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininess = 40.0;
    var materialDiffuse = vec4(0.5, 0.5, 0.5, 0.1);
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lp0));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        me);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawElements(gl.TRIANGLES, this.slenderIndices.length, gl.UNSIGNED_SHORT, 0);

    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
};



//////////////////////////  End slender's code /////////////////////////////////
