
_tmp.WebGLTextureAtlas = function () {
  var _p = TextureAtlas.prototype;
  _p._setupVBO = function () {
    var _t = this;
    var gl = _renderContext;
    //create WebGLBuffer
    _t._buffersVBO[0] = gl.createBuffer();
    _t._buffersVBO[1] = gl.createBuffer();

    _t._quadsWebBuffer = gl.createBuffer();
    _t._mapBuffers();
  };

  _p._mapBuffers = function () {
    var _t = this;
    var gl = _renderContext;

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadsWebBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, _t._quadsArrayBuffer, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _t._indices, gl.STATIC_DRAW);

    //checkGLErrorDebug();
  };

  /**
   * <p>Draws n quads from an index (offset). <br />
   * n + start can't be greater than the capacity of the atlas</p>
   * @param {Number} n
   * @param {Number} start
   */
  _p.drawNumberOfQuads = function (n, start) {
    var _t = this;
    start = start || 0;
    if (0 === n || !_t.texture || !_t.texture.isLoaded())
      return;

    var gl = _renderContext;
    glBindTexture2D(_t.texture);

    //
    // Using VBO without VAO
    //
    //vertices
    //gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
    // XXX: update is done in draw... perhaps it should be done in a timer

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadsWebBuffer);
    if (_t.dirty) {
      gl.bufferData(gl.ARRAY_BUFFER, _t._quadsArrayBuffer, gl.DYNAMIC_DRAW);
      _t.dirty = false;
    }

    gl.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_COLOR);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_TEX_COORDS);

    gl.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
    gl.vertexAttribPointer(VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
    gl.vertexAttribPointer(VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);

    if (TEXTURE_ATLAS_USE_TRIANGLE_STRIP)
      gl.drawElements(gl.TRIANGLE_STRIP, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);
    else
      gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, start * 6 * _t._indices.BYTES_PER_ELEMENT);

    global.g_NumberOfDraws++;
    //checkGLErrorDebug();
  };
  _tmp.WebGLTexture2D = function () {

  };
