function render(renderer) {
  const simulation = renderer.simulation;
  const interface = renderer.interface;
  const style = renderer.style;
  
  const width = simulation.width;
  const height = simulation.height;
  const consts = simulation.consts;
  
  const theme = interface.theme.value;
  const backtheme = interface.backtheme.value;
  
  const canvas = renderer.canvas;
  const webgl = renderer.webgl;
  const ctx = renderer.ctx;
  const gl = renderer.gl;
  
  const zoom = interface.getZoom();
  
  const canvasw = canvas.attr("width");
  const canvash = canvas.attr("height");
  
  const cellsize = canvasw/width*zoom;
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  let clans = {};
  
  if (theme === "clan") {
    for (let i = 0; i < simulation.arr.length; i++) {
      const a = simulation.arr[i];
      
      for (let j = 0; j < a.length; j++) if (simulation.type[a[j]]) clans[simulation.clan[a[j]]] = true;
    }
    
    const keys = Object.keys(clans);
    
    for (let i = 0; i < keys.length; i++) clans[keys[i]] = i/keys.length;
  }
  
  if (cellsize > 10 || !gl) {
    const maxOrganic = consts.maxOrganic;
    const maxCharge = consts.maxCharge;
    
    const energyUnit = consts.energyUnit;
    
    const sproutFallEnergy = consts.sproutFallEnergy;
    
    const cameraX = interface.cameraX;
    const cameraY = interface.cameraY;
    
    function getWoodColor(giv) {
      if (theme === "default") return style.woodAvg;
      
      giv /= energyUnit;
      
      if (giv < 100) return hexGradient(style.wood1, style.wood2, giv/100);
      else return hexGradient(style.wood2, style.wood3, (giv-100)/400);
    }
    
    function scaleX(x) {
      return (x+0.5-cameraX-width/2)*cellsize+canvasw/2;
    }
    function scaleY(y) {
      return (y+0.5-cameraY-height/2)*cellsize+canvash/2;
    }
    
    function scaleCords(x, y) {
      return [
        scaleX(x),
        scaleY(y)
      ];
    }
    
    function drawCircle(fill, x, y, w, h, r) {
      ctx.fillStyle = fill;
      
      ctx.beginPath();
      
      if (h) ctx.ellipse(x, y, w, h, r, 0, 2*Math.PI);
      else ctx.arc(x, y, w, 0, 2*Math.PI);
      
      ctx.fill();
    }
    
    function drawStrokedCircle(fill, stroke, sw, x, y, w, h, r) {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = cellsize*sw;
      
      ctx.beginPath();
      
      if (h) ctx.ellipse(x, y, w, h, r, 0, 2*Math.PI);
      else ctx.arc(x, y, w, 0, 2*Math.PI);
      
      ctx.fill();
      ctx.stroke();
    }
    
    function fillRect(color, x, y, w, h) {
      ctx.fillStyle = color;
      
      ctx.fillRect(x, y, w, h);
    }
    
    function drawSelect(x, y) {
      const cx = scaleX(x);
      const cy = scaleY(y);
      
      ctx.lineWidth = cellsize*0.1;
      ctx.lineCap = "round";
      
      ctx.strokeStyle = style.select;
      
      ctx.beginPath();
      
      ctx.moveTo(cx-cellsize*0.1, cy-cellsize*0.45);
      ctx.lineTo(cx-cellsize*0.45, cy-cellsize*0.45);
      ctx.lineTo(cx-cellsize*0.45, cy-cellsize*0.1);
      
      ctx.moveTo(cx+cellsize*0.1, cy-cellsize*0.45);
      ctx.lineTo(cx+cellsize*0.45, cy-cellsize*0.45);
      ctx.lineTo(cx+cellsize*0.45, cy-cellsize*0.1);
      
      ctx.moveTo(cx-cellsize*0.1, cy+cellsize*0.45);
      ctx.lineTo(cx-cellsize*0.45, cy+cellsize*0.45);
      ctx.lineTo(cx-cellsize*0.45, cy+cellsize*0.1);
      
      ctx.moveTo(cx+cellsize*0.1, cy+cellsize*0.45);
      ctx.lineTo(cx+cellsize*0.45, cy+cellsize*0.45);
      ctx.lineTo(cx+cellsize*0.45, cy+cellsize*0.1);
      
      ctx.stroke();
    }
    
    const sx = Math.max(Math.floor(-canvasw/2/cellsize+cameraX+width/2), 0);
    const ex = Math.min(Math.ceil(canvasw/2/cellsize+cameraX+width/2), width);
    const sy = Math.max(Math.floor(-canvash/2/cellsize+cameraY+height/2), 0);
    const ey = Math.min(Math.ceil(canvash/2/cellsize+cameraY+height/2), height);
    
    const gridw = cellsize/18 < 1 ? 0:cellsize/18;
    
    if (gridw) {
      if (backtheme === "nothing") {
        ctx.fillStyle = style.background;
        ctx.fillRect(0, 0, canvasw, canvash);
        
        ctx.fillStyle = style.grid;
        
        for (let x = sx; x <= ex; x++) ctx.fillRect(scaleX(x-0.5)-gridw/2, 0, gridw, canvash);
        for (let y = sy; y <= ey; y++) ctx.fillRect(0, scaleY(y-0.5)-gridw/2, canvasw, gridw);
      } else {
        ctx.fillStyle = style.grid;
        ctx.fillRect(0, 0, canvasw, canvash);
      }
    } else {
      ctx.fillStyle = style.background;
      ctx.fillRect(0, 0, canvasw, canvash);
    }
    
    if (backtheme === "default") for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
      const i = x+y*width;
      
      const organic = simulation.organic[i];
      const charge = simulation.charge[i];
      
      if (organic >= maxOrganic) ctx.fillStyle = cellsize < 10 ? style.potionOrganic:style.potionOrganicZoom;
      else {
        if (charge >= maxCharge) ctx.fillStyle = cellsize < 10 ? style.potionCharge:style.potionChargeZoom;
        else ctx.fillStyle = hexGradient(style.backMin, style.backMax, organic/maxOrganic);
      }
      
      ctx.fillRect(scaleX(x-0.5)+gridw/2, scaleY(y-0.5)+gridw/2, cellsize-gridw, cellsize-gridw);
    }
    if (backtheme === "poisons") for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
      const i = x+y*width;
      
      const organic = simulation.organic[i];
      const charge = simulation.charge[i];
      
      if (organic >= maxOrganic) ctx.fillStyle = cellsize < 10 ? style.potionOrganic:style.potionOrganicZoom;
      else {
        if (charge >= maxCharge) ctx.fillStyle = cellsize < 10 ? style.potionCharge:style.potionChargeZoom;
        else ctx.fillStyle = style.background;
      }
      
      ctx.fillRect(scaleX(x-0.5)+gridw/2, scaleY(y-0.5)+gridw/2, cellsize-gridw, cellsize-gridw);
    }
    if (backtheme === "organic") for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
      const i = x+y*width;
      
      const organic = simulation.organic[i];
      
      if (organic >= maxOrganic) ctx.fillStyle = "#ff0000";
      else ctx.fillStyle = hexGradient("#ffffff", "#000000", organic/maxOrganic);
      
      ctx.fillRect(scaleX(x-0.5)+gridw/2, scaleY(y-0.5)+gridw/2, cellsize-gridw, cellsize-gridw);
    }
    if (backtheme === "charge") for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
      const i = x+y*width;
      
      const charge = simulation.charge[i];
      
      if (charge >= maxCharge) ctx.fillStyle = "#0000ff";
      else ctx.fillStyle = hexGradient("#ffffff", "#000000", charge/maxCharge);
      
      ctx.fillRect(scaleX(x-0.5)+gridw/2, scaleY(y-0.5)+gridw/2, cellsize-gridw, cellsize-gridw);
    }
    
    if (theme === "default" || theme === "energy") {
      ctx.lineWidth = cellsize*0.15;
      
      ctx.lineCap = "square";
      
      for (let x = sx-1; x <= ex; x++) for (let y = sy-1; y <= ey; y++) {
        const i = x+y*width;
        
        const type = simulation.type[i];
        const angle = simulation.angle[i];
        
        const cx = scaleX(x);
        const cy = scaleY(y);
        
        if (type === 1) {
          let max = 0;
          
          for (let j = 0; j < 4; j++) {
            const shape = simulation.woodshape[i*4+j];
            
            if (shape) {
              const gived = simulation.woodgived[i*4+j];
              
              const nx = x+angleX[j];
              const ny = y+angleY[j];
              
              ctx.strokeStyle = getWoodColor(gived);
              
              ctx.beginPath();
              
              ctx.moveTo(cx, cy);
              ctx.lineTo(...scaleCords(nx, ny));
              
              ctx.stroke();
              
              if (gived > max) max = gived;
            }
          }
          
          ctx.fillStyle = getWoodColor(max);
          ctx.fillRect(cx-cellsize*0.075, cy-cellsize*0.075, cellsize*0.15, cellsize*0.15);
        }
      }
      
      for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
        const i = x+y*width;
        
        const type = simulation.type[i];
        const angle = simulation.angle[i];
        
        const cx = scaleX(x);
        const cy = scaleY(y);
        
        if (type === 2) {
          const inclr = hexGradient(style.sproutMin, style.sproutMax, simulation.energy[i]/sproutFallEnergy)
          
          drawCircle(style.sprout, cx, cy, cellsize*0.225);
          drawCircle(inclr, cx, cy, 0.1125*cellsize);
        }
        if (type === 3) drawStrokedCircle(style.seed, style.seedStroke, 0.05, cx, cy, cellsize*0.19);
        if (type === 4) drawStrokedCircle(style.seedShoot, style.seedStroke, 0.05, cx, cy, cellsize*0.19);
        if (type === 5) drawCircle(style.leaf, cx, cy, cellsize*0.3, cellsize*0.45, (angle-2)*Math.PI/2);
        if (type === 6) fillRect(style.root, cx-cellsize*0.25, cy-cellsize*0.25, cellsize*0.5, cellsize*0.5);
        if (type === 7) drawCircle(style.aerial, cx, cy, cellsize*0.3);
      }
    }
    
    if (theme === "clan") {
      for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
        const i = x+y*width;
        
        const type = simulation.type[i];
        
        if (type) {
          ctx.fillStyle = rgbToHex(...hueToRgb(clans[simulation.clan[i]]).map(x => x*200));
          
          ctx.fillRect(scaleX(x-0.5)+gridw/2, scaleY(y-0.5)+gridw/2, cellsize-gridw, cellsize-gridw);
        }
      }
    }
    
    if (interface.selectType === "tile") drawSelect(interface.selectIndex%width, Math.floor(interface.selectIndex/width));
    if (interface.selectType === "cell") for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
      const i = x+y*width;
      
      if (interface.selectType === "cell" && interface.selectUniq === simulation.uniq[i]) {
        drawSelect(x, y);
        
        break;
      }
    }
    
    ctx.fillStyle = style.edge;
    
    ctx.fillRect(0, 0, scaleX(-0.5), canvash);
    ctx.fillRect(canvasw, 0, -canvasw+scaleX(width-0.5), canvash);
    ctx.fillRect(0, 0, canvasw, scaleY(-0.5));
    ctx.fillRect(0, canvash, canvasw, -canvash+scaleY(height-0.5));
  } else {
    const cameraX = Math.trunc(interface.cameraX/width*canvasw*cellsize)/cellsize/canvasw;
    const cameraY = Math.trunc(interface.cameraY/height*canvash*cellsize)/cellsize/canvasw;
    
    gl.uniform1f(renderer.zoomloc, zoom);
    gl.uniform1f(renderer.camxloc, cameraX);
    gl.uniform1f(renderer.camyloc, cameraY);
    
    gl.uniform1i(renderer.themeloc, ["nothing", "default", "energy", "clan"].indexOf(theme));
    gl.uniform1i(renderer.backthemeloc, ["nothing", "default", "poisons", "organic", "charge"].indexOf(backtheme));
    
    {
      gl.bindTexture(gl.TEXTURE_2D, renderer.textureType);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, simulation.type, 0);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    {
      gl.bindTexture(gl.TEXTURE_2D, renderer.textureOrganic);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(simulation.organic.buffer), 0);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    {
      gl.bindTexture(gl.TEXTURE_2D, renderer.textureCharge);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(simulation.charge.buffer), 0);
      
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    
    ctx.clearRect(0, 0, canvasw, canvash);
    
    gl.viewport(0, 0, canvasw, canvash);
    
    const buf = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      -1, 1,
      1, 1,
      -1, -1,
      1, 1,
      1, -1,
    ]), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(renderer.posloc);
    gl.vertexAttribPointer(renderer.posloc, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    if (theme === "clan") {
      const sx = Math.max(Math.floor(-canvasw/2/cellsize+cameraX+width/2), 0);
      const ex = Math.min(Math.ceil(canvasw/2/cellsize+cameraX+width/2), width);
      const sy = Math.max(Math.floor(-canvash/2/cellsize+cameraY+height/2), 0);
      const ey = Math.min(Math.ceil(canvash/2/cellsize+cameraY+height/2), height);
      
      for (let x = sx; x < ex; x++) for (let y = sy; y <= ey; y++) {
        const i = x+y*width;
        
        const type = simulation.type[i];
        
        if (type) {
          ctx.fillStyle = rgbToHex(...hueToRgb(clans[simulation.clan[i]]).map(x => x*200));
          
          ctx.fillRect((x-cameraX-width/2)*cellsize+canvasw/2, (y-cameraY-height/2)*cellsize+canvash/2, cellsize, cellsize);
        }
      }
    }
  }
  
  if (interface.showCenter) {
    const px = canvas.attr("width")/200;
    
    ctx.lineCap = "round";
    
    ctx.lineWidth = px;
    
    ctx.strokeStyle = style.center;
    
    ctx.beginPath();
    
    ctx.moveTo(90*px, 100*px);
    ctx.lineTo(110*px, 100*px);
    ctx.moveTo(100*px, 90*px);
    ctx.lineTo(100*px, 110*px);
    
    ctx.stroke();
  }
}

function createRenderer(interface, simulation, style) {
  const width = simulation.width;
  const height = simulation.height;
  const consts = simulation.consts;
  
  const gl = interface.gl;
  
  const textureType = gl.createTexture();
  const textureOrganic = gl.createTexture();
  const textureCharge = gl.createTexture();
  
  const vertextext = `#version 300 es

precision highp float;

uniform float zoom;
uniform float camx;
uniform float camy;

in vec4 vertexpos;
out vec2 fragpos;

void main() {
  fragpos = vec2(
    (vertexpos.x+1.)/2.+camx,
    (-vertexpos.y+1.)/2.+camy
  );
  
  gl_Position = vertexpos;
}`;
  
  const fragmenttext = `#version 300 es

precision highp float;
precision highp int;

in vec2 fragpos;

out vec4 fragcolor;

uniform sampler2D texture_types;
uniform sampler2D texture_organic;
uniform sampler2D texture_charge;

uniform int theme;
uniform int backtheme;

void main() {
  const int width = ${width};
  const int height = ${height};
  
  const int maxOrganic = ${consts.maxOrganic};
  const int maxCharge = ${consts.maxCharge};
  
  const vec4 bgColor = ${hexToVec4(style.background)};
  const vec4 woodColor = ${hexToVec4(style.woodColor)};
  const vec4 sproutColor = ${hexToVec4(style.sproutColor)};
  const vec4 seedColor = ${hexToVec4(style.seedColor)};
  const vec4 seedShootColor = ${hexToVec4(style.seedShootColor)};
  const vec4 leafColor = ${hexToVec4(style.leafColor)};
  const vec4 rootColor = ${hexToVec4(style.rootColor)};
  const vec4 aerialColor = ${hexToVec4(style.aerialColor)};
  const vec4 edgeColor = ${hexToVec4(style.edge)};
  
  const vec4 potionOrganic = ${hexToVec4(style.potionOrganic)};
  const vec4 potionCharge = ${hexToVec4(style.potionCharge)};
  
  int x = int(fragpos.x*float(width));
  int y = int(fragpos.y*float(height));
  
  if (x < 0 || x >= width || y < 0 || y >= height) {
    fragcolor = edgeColor;
    
    return;
  }
  
  vec2 p = vec2((float(x)+0.5)/float(width), (float(y)+0.5)/float(height));
  
  int type = int(texture(texture_types, p).x*255.);
  
  vec4 organicv = texture(texture_organic, p)*255.;
  vec4 chargev = texture(texture_charge, p)*255.;
  
  int organic = (int(organicv[3]) << 24) + (int(organicv[2]) << 16) + (int(organicv[1]) << 8) + int(organicv[0]);
  int charge = (int(chargev[3]) << 24) + (int(chargev[2]) << 16) + (int(chargev[1]) << 8) + int(chargev[0]);
  
  if (backtheme == 0) fragcolor = bgColor;
  if (backtheme == 1 || backtheme == 2) {
    if (organic >= maxOrganic) fragcolor = potionOrganic;
    else {
      if (charge >= maxCharge) fragcolor = potionCharge;
      else fragcolor = bgColor;
    }
  }
  if (backtheme == 3) {
    float v = float(organic)/float(maxOrganic);
    
    if (v >= 1.) fragcolor = vec4(1, 0, 0, 1);
    else fragcolor = vec4(1.-v, 1.-v, 1.-v, 1);
  }
  if (backtheme == 4) {
    float v = float(charge)/float(maxCharge);
    
    if (v >= 1.) fragcolor = vec4(0, 0, 1, 1);
    else fragcolor = vec4(1.-v, 1.-v, 1.-v, 1);
  }
  
  if (theme == 1 || theme == 2) {
    if (type == 1) fragcolor = woodColor;
    if (type == 2) fragcolor = sproutColor;
    if (type == 3) fragcolor = seedColor;
    if (type == 4) fragcolor = seedShootColor;
    if (type == 5) fragcolor = leafColor;
    if (type == 6) fragcolor = rootColor;
    if (type == 7) fragcolor = aerialColor;
  }
}`;
  
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertextext);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmenttext);
  
  const program = createProgram(gl, vertex, fragment);
  
  gl.useProgram(program);
  
  gl.clearColor(0.5, 0.5, 0.5, 1);
  
  const obj = {
    program, gl, style,
    
    simulation, interface, style,
    canvas: interface.canvas,
    webgl: interface.webgl,
    ctx: interface.ctx,
    
    posloc: gl.getAttribLocation(program, 'vertexpos'),
    textypeloc: gl.getUniformLocation(program, 'texture_types'),
    texorganicloc: gl.getUniformLocation(program, 'texture_organic'),
    texchargeloc: gl.getUniformLocation(program, 'texture_charge'),
    zoomloc: gl.getUniformLocation(program, 'zoom'),
    camxloc: gl.getUniformLocation(program, 'camx'),
    camyloc: gl.getUniformLocation(program, 'camy'),
    themeloc: gl.getUniformLocation(program, 'theme'),
    backthemeloc: gl.getUniformLocation(program, 'backtheme'),
    
    textureType,
    textureOrganic,
    textureCharge
  };
  
  gl.uniform1i(obj.texttypeloc, 0);
  gl.uniform1i(obj.texorganicloc, 1);
  gl.uniform1i(obj.texchargeloc, 2);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, obj.textureType);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, obj.textureOrganic);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, obj.textureCharge);
  
  return obj;
}