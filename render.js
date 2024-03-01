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
  
  const cellsize = canvas.attr("width")/width*zoom;
  
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
  
  if (cellsize > 10) {
    const maxOrganic = consts.maxOrganic;
    const maxCharge = consts.maxCharge;
    
    const energyUnit = consts.energyUnit;
    
    const sproutFallEnergy = consts.sproutFallEnergy;
    
    const canvasw = canvas.attr("width");
    const canvash = canvas.attr("height");
    
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
    const canvasw = webgl.attr("width");
    const canvash = webgl.attr("height");
    
    const blockh = renderer.blockh;
    const blockl = Math.ceil(blockh*width/16)*16;
    
    const cameraX = Math.trunc(interface.cameraX/width*zoom*canvasw)*width/zoom/canvasw;
    const cameraY = Math.trunc(interface.cameraY/height*zoom*canvash)*height/zoom/canvash;
    
    ctx.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));
    
    gl.uniform1f(renderer.zoomloc, zoom);
    gl.uniform1f(renderer.camxloc, cameraX);
    gl.uniform1f(renderer.camyloc, cameraY);
    gl.uniform1i(renderer.themeloc, ["nothing", "default", "energy", "clan"].indexOf(theme));
    gl.uniform1i(renderer.backthemeloc, ["nothing", "default", "poisons", "organic", "charge"].indexOf(backtheme));
    
    gl.viewport(0, 0, canvasw, canvash);
    
    for (let i = 0; i < height; i += blockh) {
      const buf = gl.createBuffer();
      
      const sy = ((height-i+cameraY)/width-0.5)*zoom*2;
      const ey = ((height-(i+blockh)+cameraY)/width-0.5)*zoom*2;
      
      if (ey > 1) continue;
      if (sy < -1) continue;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, sy,
        -1, ey,
        1, ey,
        1, ey,
        1, sy,
        -1, sy
      ]), gl.STATIC_DRAW);
      
      gl.enableVertexAttribArray(renderer.posloc);
      gl.vertexAttribPointer(renderer.posloc, 2, gl.FLOAT, false, 0, 0);
      
      const si = i*width;
      
      if (theme !== "nothing") gl.uniform4iv(renderer.dataloc, new Int32Array(simulation.type.buffer.slice(si, si+blockl)));
      if (backtheme !== "nothing" && backtheme !== "charge") gl.uniform4iv(renderer.organicloc, new Int32Array(simulation.organic.buffer.slice(si*4, (si+blockl)*4)))
      if (backtheme !== "nothing" && backtheme !== "organic") gl.uniform4iv(renderer.chargeloc, new Int32Array(simulation.charge.buffer.slice(si*4, (si+blockl)*4)));
      
      gl.uniform1i(renderer.offsetyloc, i);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
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
  
  const blockh = Math.min(Math.floor(1800/width), height);
  
  const vertextext = `#version 300 es

precision highp float;

in vec4 vertexpos;
out vec2 fragpos;

void main() {
  fragpos = vertexpos.xy;
  
  gl_Position = vertexpos;
}`;
  
  const fragmenttext = `#version 300 es

precision highp float;
precision highp int;

in vec2 fragpos;

out vec4 fragcolor;

uniform ivec4 data[${Math.ceil(width*blockh/16)}];
uniform ivec4 organics[${Math.ceil(width*blockh/4)}];
uniform ivec4 charges[${Math.ceil(width*blockh/4)}];

uniform float zoom;
uniform float camx;
uniform float camy;
uniform int offsety;

uniform int theme;
uniform int backtheme;

void main() {
  const int width = ${width};
  const int height = ${height};
  const int blockh = ${blockh};
  
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
  
  int val = 0;
  
  int organic;
  int charge;
  
  float fx = (fragpos.x/2./zoom+0.5)*float(width)+camx;
  float fy = (-fragpos.y/2./zoom+0.5)*float(height)+camy;
  
  if (fx < 0. || fy >= float(height) || fx >= float(width)) {
    fragcolor = edgeColor;
    
    return;
  }
  
  int x = int(fx);
  int y = int(fy)-offsety;
  
  int l = x+y*width;
  
  {
    int i = l >> 4;
    int j = (l >> 2) & 3;
    int k = l & 3;
    
    val = (data[i][j] >> (8*k)) & 255;
  }
  
  {
    int i = l >> 2;
    int j = l & 3;
    
    organic = organics[i][j];
    charge = charges[i][j];
  }
  
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
    if (val == 1) fragcolor = woodColor;
    if (val == 2) fragcolor = sproutColor;
    if (val == 3) fragcolor = seedColor;
    if (val == 4) fragcolor = seedShootColor;
    if (val == 5) fragcolor = leafColor;
    if (val == 6) fragcolor = rootColor;
    if (val == 7) fragcolor = aerialColor;
  }
}`;
  
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertextext);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmenttext);
  
  const program = createProgram(gl, vertex, fragment);
  
  gl.useProgram(program);
  
  gl.clearColor(0.5, 0.5, 0.5, 1);
  
  return {
    program, gl, style, blockh,
    simulation, interface, style,
    canvas: interface.canvas,
    webgl: interface.webgl,
    ctx: interface.ctx,
    posloc: gl.getAttribLocation(program, 'vertexpos'),
    dataloc: gl.getUniformLocation(program, 'data'),
    organicloc: gl.getUniformLocation(program, 'organics'),
    chargeloc: gl.getUniformLocation(program, 'charges'),
    zoomloc: gl.getUniformLocation(program, 'zoom'),
    camxloc: gl.getUniformLocation(program, 'camx'),
    camyloc: gl.getUniformLocation(program, 'camy'),
    offsetyloc: gl.getUniformLocation(program, 'offsety'),
    themeloc: gl.getUniformLocation(program, 'theme'),
    backthemeloc: gl.getUniformLocation(program, 'backtheme')
  };
}