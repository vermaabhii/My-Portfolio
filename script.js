/* ============================================================
   LiquidEther — ported from React to vanilla JS
   Renders a fluid WebGL simulation inside #liquid-ether-bg
   ============================================================ */

(function initLiquidEther() {
  const container = document.getElementById('liquid-ether-bg');
  if (!container || typeof THREE === 'undefined') return;

  // --- Config (matches the React usage example) ---
  const CONFIG = {
    colors: ['#5227FF', '#FF9FFC', '#B497CF'],
    mouseForce: 20,
    cursorSize: 100,
    isViscous: true,
    viscous: 30,
    iterationsViscous: 32,
    iterationsPoisson: 32,
    resolution: 0.5,
    isBounce: false,
    dt: 0.014,
    BFECC: true,
    autoDemo: true,
    autoSpeed: 0.5,
    autoIntensity: 2.2,
    takeoverDuration: 0.25,
    autoResumeDelay: 3000,
    autoRampDuration: 0.6,
  };

  // --- Palette texture ---
  function makePaletteTexture(stops) {
    const arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
    const w = arr.length;
    const data = new Uint8Array(w * 4);
    for (let i = 0; i < w; i++) {
      const c = new THREE.Color(arr[i]);
      data[i * 4 + 0] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  const paletteTex = makePaletteTexture(CONFIG.colors);
  const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

  // --- Common ---
  const Common = {
    width: 0, height: 0, aspect: 1, pixelRatio: 1,
    time: 0, delta: 0, container: null, renderer: null, clock: null,
    init(el) {
      this.container = el;
      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      this.resize();
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.autoClear = false;
      this.renderer.setClearColor(new THREE.Color(0x000000), 0);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(this.width, this.height);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.display = 'block';
      this.clock = new THREE.Clock();
      this.clock.start();
    },
    resize() {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.width = Math.max(1, Math.floor(rect.width));
      this.height = Math.max(1, Math.floor(rect.height));
      this.aspect = this.width / this.height;
      if (this.renderer) this.renderer.setSize(this.width, this.height, false);
    },
    update() {
      this.delta = this.clock.getDelta();
      this.time += this.delta;
    }
  };

  // --- Mouse ---
  const Mouse = {
    mouseMoved: false,
    coords: new THREE.Vector2(),
    coords_old: new THREE.Vector2(),
    diff: new THREE.Vector2(),
    timer: null,
    container: null,
    isHoverInside: false,
    hasUserControl: false,
    isAutoActive: false,
    autoIntensity: CONFIG.autoIntensity,
    takeoverActive: false,
    takeoverStartTime: 0,
    takeoverDuration: CONFIG.takeoverDuration,
    takeoverFrom: new THREE.Vector2(),
    takeoverTo: new THREE.Vector2(),
    onInteract: null,

    init(el) {
      this.container = el;
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
      window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
      window.addEventListener('touchend', () => { this.isHoverInside = false; });
      document.addEventListener('mouseleave', () => { this.isHoverInside = false; });
    },

    isPointInside(cx, cy) {
      if (!this.container) return false;
      const rect = this.container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      return cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
    },

    setCoords(x, y) {
      if (!this.container) return;
      if (this.timer) clearTimeout(this.timer);
      const rect = this.container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (x - rect.left) / rect.width;
      const ny = (y - rect.top) / rect.height;
      this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
      this.mouseMoved = true;
      this.timer = setTimeout(() => { this.mouseMoved = false; }, 100);
    },

    setNormalized(nx, ny) {
      this.coords.set(nx, ny);
      this.mouseMoved = true;
    },

    onMouseMove(e) {
      this.isHoverInside = this.isPointInside(e.clientX, e.clientY);
      if (!this.isHoverInside) return;
      if (this.onInteract) this.onInteract();
      if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
        const rect = this.container.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        this.takeoverFrom.copy(this.coords);
        this.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
        this.takeoverStartTime = performance.now();
        this.takeoverActive = true;
        this.hasUserControl = true;
        this.isAutoActive = false;
        return;
      }
      this.setCoords(e.clientX, e.clientY);
      this.hasUserControl = true;
    },

    onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      this.isHoverInside = this.isPointInside(t.clientX, t.clientY);
      if (!this.isHoverInside) return;
      if (this.onInteract) this.onInteract();
      this.setCoords(t.clientX, t.clientY);
      this.hasUserControl = true;
    },

    onTouchMove(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      this.isHoverInside = this.isPointInside(t.clientX, t.clientY);
      if (!this.isHoverInside) return;
      if (this.onInteract) this.onInteract();
      this.setCoords(t.clientX, t.clientY);
    },

    update() {
      if (this.takeoverActive) {
        const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
        if (t >= 1) {
          this.takeoverActive = false;
          this.coords.copy(this.takeoverTo);
          this.coords_old.copy(this.coords);
          this.diff.set(0, 0);
        } else {
          const k = t * t * (3 - 2 * t);
          this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k);
        }
      }
      this.diff.subVectors(this.coords, this.coords_old);
      this.coords_old.copy(this.coords);
      if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
      if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
    }
  };

  // --- AutoDriver ---
  class AutoDriver {
    constructor(mouse, manager) {
      this.mouse = mouse;
      this.manager = manager;
      this.enabled = CONFIG.autoDemo;
      this.speed = CONFIG.autoSpeed;
      this.resumeDelay = CONFIG.autoResumeDelay;
      this.rampDurationMs = CONFIG.autoRampDuration * 1000;
      this.active = false;
      this.current = new THREE.Vector2(0, 0);
      this.target = new THREE.Vector2();
      this.lastTime = performance.now();
      this.activationTime = 0;
      this.margin = 0.2;
      this._tmpDir = new THREE.Vector2();
      this.pickNewTarget();
    }
    pickNewTarget() {
      const r = Math.random;
      this.target.set((r() * 2 - 1) * (1 - this.margin), (r() * 2 - 1) * (1 - this.margin));
    }
    forceStop() {
      this.active = false;
      this.mouse.isAutoActive = false;
    }
    update() {
      if (!this.enabled) return;
      const now = performance.now();
      const idle = now - this.manager.lastUserInteraction;
      if (idle < this.resumeDelay) { if (this.active) this.forceStop(); return; }
      if (this.mouse.isHoverInside) { if (this.active) this.forceStop(); return; }
      if (!this.active) {
        this.active = true;
        this.current.copy(this.mouse.coords);
        this.lastTime = now;
        this.activationTime = now;
      }
      this.mouse.isAutoActive = true;
      let dtSec = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (dtSec > 0.2) dtSec = 0.016;
      const dir = this._tmpDir.subVectors(this.target, this.current);
      const dist = dir.length();
      if (dist < 0.01) { this.pickNewTarget(); return; }
      dir.normalize();
      let ramp = 1;
      if (this.rampDurationMs > 0) {
        const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs);
        ramp = t * t * (3 - 2 * t);
      }
      const move = Math.min(this.speed * dtSec * ramp, dist);
      this.current.addScaledVector(dir, move);
      this.mouse.setNormalized(this.current.x, this.current.y);
    }
  }

  // --- GLSL Shaders ---
  const face_vert = `
    attribute vec3 position;
    uniform vec2 px;
    uniform vec2 boundarySpace;
    varying vec2 uv;
    precision highp float;
    void main(){
      vec3 pos = position;
      vec2 scale = 1.0 - boundarySpace * 2.0;
      pos.xy = pos.xy * scale;
      uv = vec2(0.5) + (pos.xy) * 0.5;
      gl_Position = vec4(pos, 1.0);
    }
  `;
  const line_vert = `
    attribute vec3 position;
    uniform vec2 px;
    precision highp float;
    varying vec2 uv;
    void main(){
      vec3 pos = position;
      uv = 0.5 + pos.xy * 0.5;
      vec2 n = sign(pos.xy);
      pos.xy = abs(pos.xy) - px * 1.0;
      pos.xy *= n;
      gl_Position = vec4(pos, 1.0);
    }
  `;
  const mouse_vert = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
      vec2 pos = position.xy * scale * 2.0 * px + center;
      vUv = uv;
      gl_Position = vec4(pos, 0.0, 1.0);
    }
  `;
  const advection_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform bool isBFECC;
    uniform vec2 fboSize;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
      if(isBFECC == false){
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        gl_FragColor = vec4(texture2D(velocity, uv2).xy, 0.0, 0.0);
      } else {
        vec2 spot_new = uv;
        vec2 vel_old = texture2D(velocity, uv).xy;
        vec2 spot_old = spot_new - vel_old * dt * ratio;
        vec2 vel_new1 = texture2D(velocity, spot_old).xy;
        vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
        vec2 error = spot_new2 - spot_new;
        vec2 spot_new3 = spot_new - error / 2.0;
        vec2 vel_2 = texture2D(velocity, spot_new3).xy;
        vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
        gl_FragColor = vec4(texture2D(velocity, spot_old2).xy, 0.0, 0.0);
      }
    }
  `;
  const color_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D palette;
    uniform vec4 bgColor;
    varying vec2 uv;
    void main(){
      vec2 vel = texture2D(velocity, uv).xy;
      float lenv = clamp(length(vel), 0.0, 1.0);
      vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
      vec3 outRGB = mix(bgColor.rgb, c, lenv);
      float outA = mix(bgColor.a, 1.0, lenv);
      gl_FragColor = vec4(outRGB, outA);
    }
  `;
  const divergence_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform float dt;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      float x0 = texture2D(velocity, uv - vec2(px.x, 0.0)).x;
      float x1 = texture2D(velocity, uv + vec2(px.x, 0.0)).x;
      float y0 = texture2D(velocity, uv - vec2(0.0, px.y)).y;
      float y1 = texture2D(velocity, uv + vec2(0.0, px.y)).y;
      float divergence = (x1 - x0 + y1 - y0) / 2.0;
      gl_FragColor = vec4(divergence / dt);
    }
  `;
  const externalForce_frag = `
    precision highp float;
    uniform vec2 force;
    uniform vec2 center;
    uniform vec2 scale;
    uniform vec2 px;
    varying vec2 vUv;
    void main(){
      vec2 circle = (vUv - 0.5) * 2.0;
      float d = 1.0 - min(length(circle), 1.0);
      d *= d;
      gl_FragColor = vec4(force * d, 0.0, 1.0);
    }
  `;
  const poisson_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D divergence;
    uniform vec2 px;
    varying vec2 uv;
    void main(){
      float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
      float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
      float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
      float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
      float div = texture2D(divergence, uv).r;
      gl_FragColor = vec4((p0 + p1 + p2 + p3) / 4.0 - div);
    }
  `;
  const pressure_frag = `
    precision highp float;
    uniform sampler2D pressure;
    uniform sampler2D velocity;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
      float p0 = texture2D(pressure, uv + vec2(px.x, 0.0)).r;
      float p1 = texture2D(pressure, uv - vec2(px.x, 0.0)).r;
      float p2 = texture2D(pressure, uv + vec2(0.0, px.y)).r;
      float p3 = texture2D(pressure, uv - vec2(0.0, px.y)).r;
      vec2 v = texture2D(velocity, uv).xy;
      vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
      gl_FragColor = vec4(v - gradP * dt, 0.0, 1.0);
    }
  `;
  const viscous_frag = `
    precision highp float;
    uniform sampler2D velocity;
    uniform sampler2D velocity_new;
    uniform float v;
    uniform vec2 px;
    uniform float dt;
    varying vec2 uv;
    void main(){
      vec2 old = texture2D(velocity, uv).xy;
      vec2 n0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
      vec2 n1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
      vec2 n2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
      vec2 n3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
      vec2 newv = 4.0 * old + v * dt * (n0 + n1 + n2 + n3);
      newv /= 4.0 * (1.0 + v * dt);
      gl_FragColor = vec4(newv, 0.0, 0.0);
    }
  `;

  // --- ShaderPass ---
  class ShaderPass {
    constructor(props) {
      this.props = props || {};
      this.uniforms = this.props.material?.uniforms;
      this.scene = this.camera = this.material = this.geometry = this.plane = null;
    }
    init() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      if (this.uniforms) {
        this.material = new THREE.RawShaderMaterial(this.props.material);
        this.geometry = new THREE.PlaneGeometry(2.0, 2.0);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
      }
    }
    update() {
      Common.renderer.setRenderTarget(this.props.output || null);
      Common.renderer.render(this.scene, this.camera);
      Common.renderer.setRenderTarget(null);
    }
  }

  class Advection extends ShaderPass {
    constructor(sp) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: advection_frag,
          uniforms: {
            boundarySpace: { value: sp.cellScale }, px: { value: sp.cellScale },
            fboSize: { value: sp.fboSize }, velocity: { value: sp.src.texture },
            dt: { value: sp.dt }, isBFECC: { value: true }
          }
        },
        output: sp.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
      // boundary line
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        -1,-1,0, -1,1,0, -1,1,0, 1,1,0, 1,1,0, 1,-1,0, 1,-1,0, -1,-1,0
      ]), 3));
      this.line = new THREE.LineSegments(g, new THREE.RawShaderMaterial({
        vertexShader: line_vert, fragmentShader: advection_frag, uniforms: this.uniforms
      }));
      this.scene.add(this.line);
    }
    update({ dt, isBounce, BFECC }) {
      this.uniforms.dt.value = dt;
      this.line.visible = isBounce;
      this.uniforms.isBFECC.value = BFECC;
      super.update();
    }
  }

  class ExternalForce extends ShaderPass {
    constructor(sp) {
      super({ output: sp.dst });
      super.init();
      const g = new THREE.PlaneGeometry(1, 1);
      const m = new THREE.RawShaderMaterial({
        vertexShader: mouse_vert, fragmentShader: externalForce_frag,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: {
          px: { value: sp.cellScale },
          force: { value: new THREE.Vector2() },
          center: { value: new THREE.Vector2() },
          scale: { value: new THREE.Vector2(sp.cursor_size, sp.cursor_size) }
        }
      });
      this.mouse = new THREE.Mesh(g, m);
      this.scene.add(this.mouse);
    }
    update(props) {
      const fx = (Mouse.diff.x / 2) * props.mouse_force;
      const fy = (Mouse.diff.y / 2) * props.mouse_force;
      const csx = props.cursor_size * props.cellScale.x;
      const csy = props.cursor_size * props.cellScale.y;
      const cx = Math.min(Math.max(Mouse.coords.x, -1 + csx + props.cellScale.x * 2), 1 - csx - props.cellScale.x * 2);
      const cy = Math.min(Math.max(Mouse.coords.y, -1 + csy + props.cellScale.y * 2), 1 - csy - props.cellScale.y * 2);
      const u = this.mouse.material.uniforms;
      u.force.value.set(fx, fy);
      u.center.value.set(cx, cy);
      u.scale.value.set(props.cursor_size, props.cursor_size);
      super.update();
    }
  }

  class Viscous extends ShaderPass {
    constructor(sp) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: viscous_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace }, velocity: { value: sp.src.texture },
            velocity_new: { value: sp.dst_.texture }, v: { value: sp.viscous },
            px: { value: sp.cellScale }, dt: { value: sp.dt }
          }
        },
        output: sp.dst, output0: sp.dst_, output1: sp.dst
      });
      this.init();
    }
    update({ viscous, iterations, dt }) {
      this.uniforms.v.value = viscous;
      let fbo_in, fbo_out;
      for (let i = 0; i < iterations; i++) {
        fbo_in  = i % 2 === 0 ? this.props.output0 : this.props.output1;
        fbo_out = i % 2 === 0 ? this.props.output1 : this.props.output0;
        this.uniforms.velocity_new.value = fbo_in.texture;
        this.props.output = fbo_out;
        this.uniforms.dt.value = dt;
        super.update();
      }
      return fbo_out;
    }
  }

  class Divergence extends ShaderPass {
    constructor(sp) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: divergence_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace }, velocity: { value: sp.src.texture },
            px: { value: sp.cellScale }, dt: { value: sp.dt }
          }
        },
        output: sp.dst
      });
      this.init();
    }
    update({ vel }) { this.uniforms.velocity.value = vel.texture; super.update(); }
  }

  class Poisson extends ShaderPass {
    constructor(sp) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: poisson_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace }, pressure: { value: sp.dst_.texture },
            divergence: { value: sp.src.texture }, px: { value: sp.cellScale }
          }
        },
        output: sp.dst, output0: sp.dst_, output1: sp.dst
      });
      this.init();
    }
    update({ iterations }) {
      let p_in, p_out;
      for (let i = 0; i < iterations; i++) {
        p_in  = i % 2 === 0 ? this.props.output0 : this.props.output1;
        p_out = i % 2 === 0 ? this.props.output1 : this.props.output0;
        this.uniforms.pressure.value = p_in.texture;
        this.props.output = p_out;
        super.update();
      }
      return p_out;
    }
  }

  class Pressure extends ShaderPass {
    constructor(sp) {
      super({
        material: {
          vertexShader: face_vert, fragmentShader: pressure_frag,
          uniforms: {
            boundarySpace: { value: sp.boundarySpace }, pressure: { value: sp.src_p.texture },
            velocity: { value: sp.src_v.texture }, px: { value: sp.cellScale }, dt: { value: sp.dt }
          }
        },
        output: sp.dst
      });
      this.init();
    }
    update({ vel, pressure }) {
      this.uniforms.velocity.value = vel.texture;
      this.uniforms.pressure.value = pressure.texture;
      super.update();
    }
  }

  // --- Simulation ---
  class Simulation {
    constructor() {
      this.options = {
        iterations_poisson: CONFIG.iterationsPoisson,
        iterations_viscous: CONFIG.iterationsViscous,
        mouse_force: CONFIG.mouseForce,
        resolution: CONFIG.resolution,
        cursor_size: CONFIG.cursorSize,
        viscous: CONFIG.viscous,
        isBounce: CONFIG.isBounce,
        dt: CONFIG.dt,
        isViscous: CONFIG.isViscous,
        BFECC: CONFIG.BFECC,
      };
      this.fbos = { vel_0:null, vel_1:null, vel_viscous0:null, vel_viscous1:null, div:null, pressure_0:null, pressure_1:null };
      this.fboSize = new THREE.Vector2();
      this.cellScale = new THREE.Vector2();
      this.boundarySpace = new THREE.Vector2();
      this.calcSize();
      this.createAllFBO();
      this.createShaderPass();
    }
    getFloatType() {
      return /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
    }
    createAllFBO() {
      const opts = {
        type: this.getFloatType(), depthBuffer: false, stencilBuffer: false,
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping
      };
      for (let k in this.fbos) this.fbos[k] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
    }
    createShaderPass() {
      this.advection = new Advection({ cellScale: this.cellScale, fboSize: this.fboSize, dt: this.options.dt, src: this.fbos.vel_0, dst: this.fbos.vel_1 });
      this.externalForce = new ExternalForce({ cellScale: this.cellScale, cursor_size: this.options.cursor_size, dst: this.fbos.vel_1 });
      this.viscous = new Viscous({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, viscous: this.options.viscous, src: this.fbos.vel_1, dst: this.fbos.vel_viscous1, dst_: this.fbos.vel_viscous0, dt: this.options.dt });
      this.divergence = new Divergence({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.vel_viscous0, dst: this.fbos.div, dt: this.options.dt });
      this.poisson = new Poisson({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.div, dst: this.fbos.pressure_1, dst_: this.fbos.pressure_0 });
      this.pressure = new Pressure({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src_p: this.fbos.pressure_0, src_v: this.fbos.vel_viscous0, dst: this.fbos.vel_0, dt: this.options.dt });
    }
    calcSize() {
      const w = Math.max(1, Math.round(this.options.resolution * Common.width));
      const h = Math.max(1, Math.round(this.options.resolution * Common.height));
      this.cellScale.set(1 / w, 1 / h);
      this.fboSize.set(w, h);
    }
    resize() {
      this.calcSize();
      for (let k in this.fbos) this.fbos[k].setSize(this.fboSize.x, this.fboSize.y);
    }
    update() {
      if (this.options.isBounce) this.boundarySpace.set(0, 0);
      else this.boundarySpace.copy(this.cellScale);
      this.advection.update({ dt: this.options.dt, isBounce: this.options.isBounce, BFECC: this.options.BFECC });
      this.externalForce.update({ cursor_size: this.options.cursor_size, mouse_force: this.options.mouse_force, cellScale: this.cellScale });
      let vel = this.fbos.vel_1;
      if (this.options.isViscous) vel = this.viscous.update({ viscous: this.options.viscous, iterations: this.options.iterations_viscous, dt: this.options.dt });
      this.divergence.update({ vel });
      const pressure = this.poisson.update({ iterations: this.options.iterations_poisson });
      this.pressure.update({ vel, pressure });
    }
  }

  // --- Output ---
  class Output {
    constructor() {
      this.simulation = new Simulation();
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      this.output = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.RawShaderMaterial({
          vertexShader: face_vert, fragmentShader: color_frag,
          transparent: true, depthWrite: false,
          uniforms: {
            velocity: { value: this.simulation.fbos.vel_0.texture },
            boundarySpace: { value: new THREE.Vector2() },
            palette: { value: paletteTex },
            bgColor: { value: bgVec4 }
          }
        })
      );
      this.scene.add(this.output);
    }
    resize() { this.simulation.resize(); }
    render() {
      Common.renderer.setRenderTarget(null);
      Common.renderer.render(this.scene, this.camera);
    }
    update() { this.simulation.update(); this.render(); }
  }

  // --- WebGLManager ---
  class WebGLManager {
    constructor(el) {
      Common.init(el);
      Mouse.init(el);
      Mouse.autoIntensity = CONFIG.autoIntensity;
      Mouse.takeoverDuration = CONFIG.takeoverDuration;
      this.lastUserInteraction = performance.now();
      Mouse.onInteract = () => {
        this.lastUserInteraction = performance.now();
        if (this.autoDriver) this.autoDriver.forceStop();
      };
      this.autoDriver = new AutoDriver(Mouse, this);
      el.prepend(Common.renderer.domElement);
      this.output = new Output();
      this._loop = this.loop.bind(this);
      this.running = false;
      this._raf = null;

      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        document.hidden ? this.pause() : this.start();
      });
    }
    resize() { Common.resize(); this.output.resize(); }
    loop() {
      if (!this.running) return;
      if (this.autoDriver) this.autoDriver.update();
      Mouse.update();
      Common.update();
      this.output.update();
      this._raf = requestAnimationFrame(this._loop);
    }
    start() { if (this.running) return; this.running = true; this.loop(); }
    pause() { this.running = false; if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
  }

  // --- Boot ---
  container.style.position = 'absolute';
  container.style.overflow = 'hidden';

  const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || window.innerWidth <= 768;

  if (isMobileDevice) {
    // Hide WebGL container entirely on mobile — dot grid takes over
    container.style.display = 'none';
  } else {
    const manager = new WebGLManager(container);

    // Pause when hero is scrolled out of view
    const io = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
      visible && !document.hidden ? manager.start() : manager.pause();
    }, { threshold: [0, 0.01, 0.1] });
    io.observe(container);

    manager.start();
  }
})();

/* ============================================================
   Mobile Dot Grid Background — lightweight canvas fallback
   Renders only on touch/mobile devices instead of WebGL fluid
   ============================================================ */
(function initDotGrid() {
  const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    || window.innerWidth <= 768;
  if (!isMobileDevice) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'dot-grid-canvas';
  canvas.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;
  `;
  hero.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const DOT_SPACING = 28;
  const DOT_RADIUS = 1.2;
  const WAVE_SPEED = 0.0008;
  const WAVE_SCALE = 0.006;
  const PULSE_AMOUNT = 0.7;

  let W, H, cols, rows, startTime = performance.now();
  let animId;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = hero.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    cols = Math.ceil(W / DOT_SPACING) + 1;
    rows = Math.ceil(H / DOT_SPACING) + 1;
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    const t = (ts - startTime) * WAVE_SPEED;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * DOT_SPACING;
        const y = r * DOT_SPACING;

        // Sine wave ripple across the grid
        const wave = Math.sin(x * WAVE_SCALE + t) * Math.cos(y * WAVE_SCALE + t * 0.7);
        const alpha = 0.25 + wave * PULSE_AMOUNT * 0.25;
        const radius = DOT_RADIUS + wave * PULSE_AMOUNT * 0.5;

        // Purple-to-pink gradient tint based on position
        const hue = 265 + (x / W) * 40;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, radius), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 70%, 70%, ${Math.max(0, alpha)})`;
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Pause when hero scrolls out of view
  const io = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible) {
      startTime = performance.now() - (animId ? 0 : 0);
      animId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.01 });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
    else { animId = requestAnimationFrame(draw); }
  });

  resize();
  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); animId = requestAnimationFrame(draw); });
  io.observe(hero);
  animId = requestAnimationFrame(draw);
})();

/* ============================================================
   TargetCursor — ported from React/GSAP to vanilla JS
   ============================================================ */
(function initTargetCursor() {
  const isMobile = (() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const ua = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
    const mobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    return (hasTouchScreen && isSmallScreen) || mobileUA;
  })();

  if (isMobile || typeof gsap === 'undefined') return;

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'target-cursor-wrapper';
  wrapper.innerHTML = `
    <div class="target-cursor-dot"></div>
    <div class="target-cursor-corner corner-tl"></div>
    <div class="target-cursor-corner corner-tr"></div>
    <div class="target-cursor-corner corner-br"></div>
    <div class="target-cursor-corner corner-bl"></div>
  `;
  document.body.appendChild(wrapper);

  const dot = wrapper.querySelector('.target-cursor-dot');
  const corners = Array.from(wrapper.querySelectorAll('.target-cursor-corner'));

  const BORDER = 3;
  const CORNER_SIZE = 12;
  const TARGET_SELECTOR = 'a, button, .skill-box, .project-card, .stat-box, .contact-link, .cta-button, .timeline-card';
  const SPIN_DURATION = 2;
  const HOVER_DURATION = 0.2;

  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;
  let activeStrength = 0;
  let targetCornerPositions = null;
  let spinTl = null;
  let tickerAdded = false;

  gsap.set(wrapper, {
    xPercent: -50, yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  // Default corner positions (collapsed around cursor centre)
  const resetCorners = () => {
    const pos = [
      { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
      { x:  CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
      { x:  CORNER_SIZE * 0.5, y:  CORNER_SIZE * 0.5 },
      { x: -CORNER_SIZE * 1.5, y:  CORNER_SIZE * 0.5 }
    ];
    corners.forEach((c, i) => gsap.set(c, { x: pos[i].x, y: pos[i].y }));
  };
  resetCorners();

  const createSpinTl = () => {
    if (spinTl) spinTl.kill();
    spinTl = gsap.timeline({ repeat: -1 })
      .to(wrapper, { rotation: '+=360', duration: SPIN_DURATION, ease: 'none' });
  };
  createSpinTl();

  // Ticker: lerp corners toward target element bounds
  const tickerFn = () => {
    if (!targetCornerPositions || activeStrength === 0) return;
    const cx = gsap.getProperty(wrapper, 'x');
    const cy = gsap.getProperty(wrapper, 'y');

    corners.forEach((corner, i) => {
      const curX = gsap.getProperty(corner, 'x');
      const curY = gsap.getProperty(corner, 'y');
      const tX = targetCornerPositions[i].x - cx;
      const tY = targetCornerPositions[i].y - cy;
      const fX = curX + (tX - curX) * activeStrength;
      const fY = curY + (tY - curY) * activeStrength;
      const dur = activeStrength >= 0.99 ? 0.2 : 0.05;
      gsap.to(corner, { x: fX, y: fY, duration: dur, ease: 'power1.out', overwrite: 'auto' });
    });
  };

  // Mouse move
  window.addEventListener('mousemove', e => {
    gsap.to(wrapper, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power3.out' });
  });

  // Click press/release
  window.addEventListener('mousedown', () => {
    gsap.to(dot, { scale: 0.7, duration: 0.3 });
    gsap.to(wrapper, { scale: 0.9, duration: 0.2 });
  });
  window.addEventListener('mouseup', () => {
    gsap.to(dot, { scale: 1, duration: 0.3 });
    gsap.to(wrapper, { scale: 1, duration: 0.2 });
  });

  const detachFromTarget = (target) => {
    if (currentLeaveHandler) {
      target.removeEventListener('mouseleave', currentLeaveHandler);
      currentLeaveHandler = null;
    }
  };

  // Hover enter
  window.addEventListener('mouseover', e => {
    const target = e.target.closest(TARGET_SELECTOR);
    if (!target) return;
    if (activeTarget === target) return;
    if (activeTarget) detachFromTarget(activeTarget);
    if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

    activeTarget = target;
    corners.forEach(c => gsap.killTweensOf(c));

    gsap.killTweensOf(wrapper, 'rotation');
    spinTl?.pause();
    gsap.set(wrapper, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const cx = gsap.getProperty(wrapper, 'x');
    const cy = gsap.getProperty(wrapper, 'y');

    targetCornerPositions = [
      { x: rect.left   - BORDER,              y: rect.top    - BORDER },
      { x: rect.right  + BORDER - CORNER_SIZE, y: rect.top    - BORDER },
      { x: rect.right  + BORDER - CORNER_SIZE, y: rect.bottom + BORDER - CORNER_SIZE },
      { x: rect.left   - BORDER,              y: rect.bottom + BORDER - CORNER_SIZE }
    ];

    if (!tickerAdded) { gsap.ticker.add(tickerFn); tickerAdded = true; }

    gsap.to({ v: activeStrength }, {
      v: 1, duration: HOVER_DURATION, ease: 'power2.out',
      onUpdate() { activeStrength = this.targets()[0].v; }
    });

    corners.forEach((c, i) => {
      gsap.to(c, {
        x: targetCornerPositions[i].x - cx,
        y: targetCornerPositions[i].y - cy,
        duration: 0.2, ease: 'power2.out'
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFn); tickerAdded = false;
      activeStrength = 0;
      targetCornerPositions = null;
      activeTarget = null;

      corners.forEach(c => gsap.killTweensOf(c));
      const pos = [
        { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
        { x:  CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
        { x:  CORNER_SIZE * 0.5, y:  CORNER_SIZE * 0.5 },
        { x: -CORNER_SIZE * 1.5, y:  CORNER_SIZE * 0.5 }
      ];
      corners.forEach((c, i) => gsap.to(c, { x: pos[i].x, y: pos[i].y, duration: 0.3, ease: 'power3.out' }));

      resumeTimeout = setTimeout(() => {
        if (!activeTarget) createSpinTl();
        resumeTimeout = null;
      }, 50);

      detachFromTarget(target);
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  }, { passive: true });

  // Scroll: drop target if cursor left the element
  window.addEventListener('scroll', () => {
    if (!activeTarget) return;
    const cx = gsap.getProperty(wrapper, 'x');
    const cy = gsap.getProperty(wrapper, 'y');
    const el = document.elementFromPoint(cx, cy);
    if (!el || !el.closest(TARGET_SELECTOR)) {
      if (currentLeaveHandler) currentLeaveHandler();
    }
  }, { passive: true });
})();

/* ============================================================
   Intersection observer for scroll-reveal animations
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .project-card, .skill-box').forEach(el => revealObserver.observe(el));

/* ============================================================
   Active nav highlighting on scroll
   ============================================================ */
const navLinks = document.querySelectorAll('[data-nav]');
const sections = document.querySelectorAll('.section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`[data-nav="${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => navObserver.observe(s));

/* ============================================================
   Contact form — Formspree async submit
   ============================================================ */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn = document.getElementById('form-submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
      } else {
        submitBtn.textContent = 'Failed — try email directly';
        submitBtn.disabled = false;
      }
    } catch {
      submitBtn.textContent = 'Network error — try again';
      submitBtn.disabled = false;
    }
  });
}

/* ============================================================
   Smooth scroll helpers
   ============================================================ */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      scrollToSection(href.slice(1));
    }
  });
});

/* ============================================================
   Dynamic footer year
   ============================================================ */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   Scroll Progress Bar
   ============================================================ */
const scrollBar = document.getElementById('scroll-progress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollBar) scrollBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============================================================
   Page load fade-in
   ============================================================ */
window.addEventListener('load', () => { document.body.style.opacity = '1'; });
