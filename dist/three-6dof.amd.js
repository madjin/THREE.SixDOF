define(['exports', 'three'], function (exports, three) { 'use strict';

    var frag = "#define GLSLIFY 1\nuniform sampler2D map;\nuniform sampler2D depthMap;\nuniform float debugDepth;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\n\nvoid main() {\n    vec4 depthColorMixer = mix(texture2D(map, vUv), texture2D(depthMap, vUv), debugDepth);\n    gl_FragColor = depthColorMixer;\n}"; // eslint-disable-line

    var vert = "#define GLSLIFY 1\nvarying vec2 vUv;\nvarying vec3 vNormal;\n\nuniform sampler2D map;\nuniform sampler2D depthMap;\nuniform bool isSeperate;\nuniform float pointSize;\n\nvoid main() {\n    vUv = uv;\n    vNormal = normalMatrix * normal;\n    gl_PointSize = pointSize;\n\n    // Transform the vert by the depth value (per vertex in the normals direction)\n    vec3 vertPos = position;\n    vertPos += texture2D(depthMap, uv).r * vNormal;\n\n    gl_Position = projectionMatrix *\n                    modelViewMatrix *\n                    vec4(vertPos, 1.0);\n}"; // eslint-disable-line

    var Uniforms = {
      'map': {
        type: 't',
        value: null
      },
      'depthMap': {
        type: 't',
        value: null
      },
      'time': {
        type: 'f',
        value: 0.0
      },
      'opacity': {
        type: 'f',
        value: 1.0
      },
      'pointSize': {
        type: 'f',
        value: 3.0
      },
      'debugDepth': {
        type: 'f',
        value: 0.0
      },
      'isSeperate': {
        type: 'b',
        value: false
      }
    };

    (function (TextureType) {
      TextureType[TextureType["TOP_BOTTOM"] = 0] = "TOP_BOTTOM";
      TextureType[TextureType["SEPERATE"] = 1] = "SEPERATE";
    })(exports.TextureType || (exports.TextureType = {}));

    var MeshDensity;

    (function (MeshDensity) {
      MeshDensity[MeshDensity["LOW"] = 64] = "LOW";
      MeshDensity[MeshDensity["MEDIUM"] = 128] = "MEDIUM";
      MeshDensity[MeshDensity["HIGH"] = 256] = "HIGH";
      MeshDensity[MeshDensity["EXTRA_HIGH"] = 512] = "EXTRA_HIGH";
    })(MeshDensity || (MeshDensity = {}));

    var Style;

    (function (Style) {
      Style[Style["WIRE"] = 0] = "WIRE";
      Style[Style["POINTS"] = 1] = "POINTS";
      Style[Style["MESH"] = 2] = "MESH";
    })(Style || (Style = {}));

    class Viewer extends three.Object3D {
      constructor() {
        var _this;

        var texturePath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
        var depthPath = arguments.length > 1 ? arguments[1] : undefined;
        var textureType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : exports.TextureType.SEPERATE;
        var meshDensity = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : MeshDensity.EXTRA_HIGH;
        var style = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Style.MESH;
        super();
        _this = this;
        this.props = void 0;
        this.loader = new three.TextureLoader();
        this.obj = void 0;
        this.geometry = void 0;
        this.material = new three.ShaderMaterial({
          uniforms: Uniforms,
          vertexShader: vert,
          fragmentShader: frag,
          transparent: true,
          side: three.BackSide
        });
        if (!texturePath) throw new Error('Texture path must be defined when creating a viewer');
        this.geometry = new three.SphereBufferGeometry(10, meshDensity, meshDensity);

        if (textureType === exports.TextureType.SEPERATE) {
          if (!depthPath) throw new Error('When using seperate textures you must provide a depth texture as well'); // Inform the shader we are providing two seperate textures

          this.material.uniforms.isSeperate.value = true; // Load the depth map

          this.load(depthPath).then(function (texture) {
            _this.material.uniforms.depthMap.value = texture;
          })["catch"](function (err) {
            throw new Error(err);
          });
        } // Load the texture


        this.load(texturePath).then(function (texture) {
          _this.material.uniforms.map.value = texture;
        })["catch"](function (err) {
          throw new Error(err);
        }); // Create the Mesh/Points and add it to the viewer object

        this.obj = this.createSceneObjectWithStyle(style);
        this.add(this.obj);
      }

      createSceneObjectWithStyle(style) {
        switch (style) {
          case Style.WIRE:
            this.material.wireframe = true;

          case Style.MESH:
            return new three.Mesh(this.geometry, this.material);

          case Style.POINTS:
            return new three.Points(this.geometry, this.material);
        }
      }

      load(texturePath) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          _this2.loader.load(texturePath, function (texture) {
            return resolve(texture);
          }, undefined, function () {
            return reject("Error loading texture error");
          });
        });
      }

    }

    exports.Viewer = Viewer;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=three-6dof.amd.js.map
