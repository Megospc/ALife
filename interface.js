function setupInterface(main, simulation, props = {}) {
  const obj = {
    paused: false,
    cameraX: 0,
    cameraY: 0,
    showCenter: false,
    changed: true,
    
    selectType: "none",
    selectUniq: -1,
    selectIndex: -1,
    
    strings: props.strings
  };
  
  const strings = obj.strings;
  
  obj.main = new Element(main);
  
  obj.ranges = new DivElement().to(obj.main);
  obj.zoom = new RangeInput(strings.zoom, 10, 200, 10).to(obj.ranges);
  obj.speed = new RangeInput(strings.speed, 0, 19, 19).to(obj.ranges);
  
  obj.topbuttons = new DivElement().to(obj.main);
  obj.pause = new ButtonElement(strings.pause, function() {
    obj.paused = !obj.paused;
    
    this.attr("textContent", obj.paused ? strings.continue:strings.pause);
  }).to(obj.topbuttons);
  obj.center = new ButtonElement(strings.tocenter, function() {
    obj.zoom.value = 10;
    obj.cameraX = 0;
    obj.cameraY = 0;
    obj.changed = true;
  }).to(obj.topbuttons);
  obj.snapshot = new ButtonElement(strings.snapshot, function() {
    const src1 = obj.webgl.call("toDataURL", "image/png");
    const src2 = obj.canvas.call("toDataURL", "image/png");
    
    const img1 = new Image();
    const img2 = new Image();
    
    img1.src = src1;
    
    img1.onload = () => {
      img2.src = src2;
      
      img2.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = interface.canvas.attr("width");
        canvas.height = interface.canvas.attr("height");
        
        ctx.drawImage(img1, 0, 0);
        ctx.drawImage(img2, 0, 0);
        
        download(canvas.toDataURL("image/png"), "alife.png");
      };
    };
  }).to(obj.topbuttons);
  
  obj.topstats = new DivElement().to(obj.main);
  obj.frame = new StatElement(strings.iteration, 0).to(obj.topstats);
  obj.population = new StatElement(strings.population, 0).to(obj.topstats);
  obj.fps = new StatElement(strings.fps, 0).to(obj.topstats);
  
  obj.themes = new DivElement().to(obj.main);
  obj.theme = new SelectElement(strings.rendermodeHeader, [
    ["default", strings.rendermodeValues[0]],
    ["energy", strings.rendermodeValues[1]],
    ["clan", strings.rendermodeValues[2]],
    ["nothing", strings.rendermodeValues[3]]
  ], "default").attr("onchange", () => obj.changed = true).to(obj.themes);
  obj.backtheme = new SelectElement(strings.groundmodeHeader, [
    ["default", strings.groundmodeValues[0]],
    ["organic", strings.groundmodeValues[1]],
    ["charge", strings.groundmodeValues[2]],
    ["nothing", strings.groundmodeValues[3]]
  ], "default").attr("onchange", () => obj.changed = true).to(obj.themes);
  
  obj.canvasdiv = new DivElement().to(obj.main);
  obj.webgl = new Element({
    elementType: "canvas",
    className: "canvas"
  }).to(obj.canvasdiv);
  obj.canvas = new Element({
    elementType: "canvas",
    className: "canvas"
  }).to(obj.canvasdiv);
  obj.ctx = obj.canvas.call("getContext", "2d");
  obj.gl = obj.webgl.call("getContext", "webgl2", {
    preserveDrawingBuffer: true
  });
  
  obj.undercanvas = new DivElement().to(obj.main);
  
  obj.infodiv = new DivElement().to(obj.undercanvas).hide();
  obj.info = new Element({
    elementType: "textarea",
    className: "textarea",
    readOnly: true
  }).to(obj.infodiv);
  
  obj.infobtns = new DivElement().to(obj.infodiv);
  obj.infocopy = new ButtonElement(strings.infoCopy, function() {
    if (navigator.clipboard) navigator.clipboard.writeText(obj.info.value);
  }).to(obj.infobtns);
  obj.infohide = new ButtonElement(strings.infoHide, function() {
    obj.selectType = "none";
    obj.changed = true;
  }).to(obj.infobtns);
  
  obj.addonenergydiv = new DivElement().to(obj.undercanvas);
  
  obj.renderoff = new CheckInput(strings.renderoff, false).to(obj.undercanvas);
  obj.rendertime = new StatElement(strings.rendertime, 0, strings.ms).to(obj.undercanvas);
  obj.handletime = new StatElement(strings.handletime, 0, strings.ms).to(obj.undercanvas);
  obj.seed = new StatElement(strings.seed, simulation.seed).to(obj.undercanvas);
  
  obj.getZoom = function() {
    return this.zoom.value/10;
  };
  
  {
    const canvasw = obj.canvas.attr("width");
    const canvash = obj.canvas.attr("height");
    
    let s, sx, sy, scx, scy, st;
    let lx, ly;
    
    let jump = false;
    let seltheme = false;
    let selbacktheme = false;
    
    function touchstart(x, y) {
      if (jump) {
        const zoom = obj.getZoom();
        
        obj.cameraX += (x/canvasw-0.5)*simulation.width/zoom;
        obj.cameraY += (y/canvash-0.5)*simulation.height/zoom;
      } else {
        s = true;
        sx = x;
        sy = y;
        scx = obj.cameraX;
        scy = obj.cameraY;
        st = performance.now();
        
        [lx, ly] = [x, y];
        
        obj.showCenter = true;
        
        obj.changed = true;
      }
    }
    
    function touchmove(x, y) {
      if (s) {
        const zoom = obj.getZoom();
        
        obj.cameraX = scx-(x-sx)/canvasw*simulation.width/zoom;
        obj.cameraY = scy-(y-sy)/canvash*simulation.height/zoom;
        
        obj.changed = true;
      }
      
      [lx, ly] = [x, y];
    }
    
    function touchend(x, y, e = true) {
      s = false;
      
      obj.showCenter = false;
      
      obj.changed = true;
      
      if (performance.now()-st < 300) {
        if (e) {
          const zoom = obj.getZoom();
          
          const cx = Math.floor((x/canvasw-0.5)*simulation.width/zoom+obj.cameraX+simulation.width/2);
          const cy = Math.floor((y/canvash-0.5)*simulation.height/zoom+obj.cameraY+simulation.height/2);
          
          if (cx < 0 || cx >= simulation.width || cy < 0 || cy >= simulation.height) return;
          
          const ci = cx+cy*simulation.width;
          const ct = simulation.type[ci];
          
          if (ct) {
            obj.selectType = "cell";
            obj.selectUniq = simulation.uniq[ci];
          } else {
            obj.selectType = "tile";
            obj.selectIndex = ci;
          }
        }
      }
    }
    
    function transformCords(e) {
      e.preventDefault();
      
      const b = obj.canvas.clientRect();
      
      return [
        (e.touches[0].clientX-b.left)/b.width*canvasw,
        (e.touches[0].clientY-b.top)/b.height*canvash
      ];
    }
    
    function transformCordsMouse(e) {
      e.preventDefault();
      
      const b = obj.canvas.clientRect();
      
      return [
        (e.clientX-b.left)/b.width*canvasw,
        (e.clientY-b.top)/b.height*canvash
      ];
    }
    
    if ("ontouchstart" in document) {
      obj.canvas.event("touchstart", e => touchstart(...transformCords(e)));
      obj.canvas.event("touchmove", e => touchmove(...transformCords(e)));
      obj.canvas.event("touchend", e => touchend(lx, ly));
    } else {
      obj.canvas.event("mousedown", e => touchstart(...transformCordsMouse(e)));
      obj.canvas.event("mousemove", e => touchmove(...transformCordsMouse(e)));
      obj.canvas.event("mouseup", e => touchend(lx, ly));
      obj.canvas.event("mouseout", e => touchend(lx, ly, false));
    }
    
    obj.canvas.event("wheel", e => {
      e.preventDefault();
      
      obj.zoom.value *= 1+Math.max(Math.min(-e.deltaY/500, 0.5), -0.5);

      obj.changed = true;
    });
    
    document.addEventListener("keydown", e => {
      if (e.ctrlKey) return;
      
      if (e.code == "Space" || e.code.includes("Arrow")) e.preventDefault();
      
      const zoom = obj.getZoom();
      
      switch (e.code) {
        case "KeyJ":
          jump = true;
          break;
        case "KeyT":
          seltheme = true;
          break;
        case "KeyY":
          selbacktheme = true;
          break;
        
        case "KeyS":
          obj.speed.value--;
          break;
        case "KeyF":
          obj.speed.value++;
          break;
        
        case "ArrowDown":
          obj.cameraY += simulation.height/zoom/20;
          obj.changed = true;
          break;
        case "ArrowUp":
          obj.cameraY -= simulation.height/zoom/20;
          obj.changed = true;
          break;
        case "ArrowLeft":
          obj.cameraX -= simulation.width/zoom/20;
          obj.changed = true;
          break;
        case "ArrowRight":
          obj.cameraX += simulation.width/zoom/20;
          obj.changed = true;
          break;
        
        case "Minus":
          obj.zoom.value *= 0.8;
          obj.changed = true;
          break;
        case "Equal":
          obj.zoom.value *= 1.2;
          obj.changed = true;
          break;
      }
      
      if (e.code.includes("Digit")) {
        const v = +e.code[5];
        
        if (seltheme && v < 3) obj.theme.value = ["nothing", "default", "energy", "clan"][v];
        if (selbacktheme && v < 4) obj.backtheme.value = ["nothing", "default", "organic", "charge"][v];
        
        obj.changed = true;
      }
    });
    
    document.addEventListener("keyup", e => {
      if (e.ctrlKey) return;
      
      switch (e.code) {
        case "KeyJ":
          jump = false;
          break;
        case "KeyT":
          seltheme = false;
          break;
        case "KeyY":
          selbacktheme = false;
          break;
        
        case "Space":
        case "KeyP":
          obj.pause.onclick();
          break;
        case "KeyR":
          obj.renderoff.value = !obj.renderoff.value;
          break;
        case "KeyO":
          obj.center.onclick();
          break;
      }
    });
  }
  
  if (props.targetsize) {
    obj.canvas.attr("width", props.targetsize);
    obj.canvas.attr("height", props.targetsize);
    obj.webgl.attr("width", props.targetsize);
    obj.webgl.attr("height", props.targetsize);
    
    obj.zoom.input.max = simulation.width/2;
  }
  
  return obj;
}

function setupSettings(main, props) {
  const obj = {
    strings: props.strings
  };
  
  const strings = obj.strings;
  
  obj.main = new Element(main);
  
  obj.header = new Element({
    elementType: "h1",
    textContent: strings.setupHeader
  }).to(obj.main);
  
  obj.seed = new NumberInput(strings.setupSeedHeader, 1, 2147483646, 1, true).append(
    new ButtonElement(strings.setupSeedNew, () => obj.randomSeed(), "minibtn")
  ).to(obj.main);
  
  obj.size = new SelectElement(strings.setupSizeHeader, [
    [50, strings.setupSizeValues[0]],
    [100, strings.setupSizeValues[1]],
    [200, strings.setupSizeValues[2]],
    [300, strings.setupSizeValues[3]],
    [400, strings.setupSizeValues[4]],
    [600, strings.setupSizeValues[5]],
    [800, strings.setupSizeValues[6]],
    [1200, strings.setupSizeValues[7]],
    [1800, strings.setupSizeValues[8]]
  ], 400).to(obj.main);
  
  obj.sun = new SelectElement(strings.setupSunHeader, [
    [100, strings.setupSunValues[0]],
    [200, strings.setupSunValues[1]],
    [300, strings.setupSunValues[2]],
    [500, strings.setupSunValues[3]],
    [750, strings.setupSunValues[4]],
    [1000, strings.setupSunValues[5]],
    [2000, strings.setupSunValues[6]]
  ], 500).to(setup);
  
  obj.density = new SelectElement(strings.setupDensityHeader, [
    [3, strings.setupDensityValues[0]],
    [4, strings.setupDensityValues[1]],
    [6, strings.setupDensityValues[2]],
    [9, strings.setupDensityValues[3]],
    [16, strings.setupDensityValues[4]],
    [25, strings.setupDensityValues[5]],
    [36, strings.setupDensityValues[6]],
    [50, strings.setupDensityValues[7]],
  ], 9).to(setup);
  
  obj.resources = new SelectElement(strings.setupResourcesHeader, [
    [1000, strings.setupResourcesValues[0]],
    [2000, strings.setupResourcesValues[1]],
    [5000, strings.setupResourcesValues[2]],
    [10000, strings.setupResourcesValues[3]],
    [20000, strings.setupResourcesValues[4]],
    [30000, strings.setupResourcesValues[5]],
    [40000, strings.setupResourcesValues[6]]
  ], 10000).to(setup);
  
  obj.start = new ButtonElement(strings.setupStart, () => props.onstart()).to(setup);
  
  obj.randomSeed = function() {
    obj.seed.value = generateRandomSeed();
  };
  
  return obj;
}

function setupLanguageChanger(main, strings, language) {
  main.attr("className", "langdiv");
  
  new Element({
    elementType: "label",
    textContent: strings.language+": "
  }).to(main);
  
  if (language !== "en") new Element({
    elementType: "a",
    textContent: "ENG 🇺🇸",
    className: "lang",
    href: "?lang=en"
  }).to(main);
  if (language !== "ru") new Element({
    elementType: "a",
    textContent: "RUS 🇷🇺",
    className: "lang",
    href: "?lang=ru"
  }).to(main);
}

function startWindow(startCallbacks, frameCallbacks, interface, simulation, renderer) {
  for (let i = 0; i < startCallbacks.length; i++) startCallbacks[i]();
  
  let lastTime = performance.now();
  let lastRenderedFrame = -1;
  let lastRenderedZoom = -1;
  let lastHandleFrame = 0;
  let frame = 0;
  
  setInterval(() => {
    const renderstart = performance.now();
    
    if (interface.renderoff.value) interface.canvasdiv.hide();
    else {
      interface.canvasdiv.show();
      
      const zoom = interface.getZoom();
      
      if (interface.changed || lastRenderedFrame !== simulation.frame || lastRenderedZoom !== zoom) {
        render(renderer);
        
        lastRenderedFrame = simulation.frame;
        lastRenderedZoom = zoom;
        
        interface.changed = false;
      }
    }
    
    updateSelectInfo(interface, simulation);
    
    const rendertime = performance.now()-renderstart;
    
    const handlestart = performance.now();
    
    if (!interface.paused && (frame-lastHandleFrame) >= (20-interface.speed.value)) {
      iteration(simulation);
      
      lastHandleFrame = frame;
    }
    
    const handletime = performance.now()-handlestart;
    
    interface.frame.value = simulation.frame;
    interface.population.value = simulation.population;
    
    interface.rendertime.value = rendertime.toFixed(1);
    interface.handletime.value = handletime.toFixed(1);
    
    for (let i = 0; i < frameCallbacks.length; i++) frameCallbacks[i]();
    
    frame++;
    
    if (frame%10 === 0) {
      const time = performance.now();
      
      interface.fps.value = (1000/(time-lastTime)*10).toFixed(1);
      
      lastTime = time;
    }
  }, 20);
}

function updateSelectInfo(interface, simulation) {
  const methods = simulation.methods;
  
  const consts = simulation.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeHeight*genomeWidth;
  
  const maxOrganic = consts.maxOrganic;
  const maxCharge = consts.maxCharge;
  
  const sproutFallEnergy = consts.sproutFallEnergy;
  const seedFallEnergy = consts.seedFallEnergy;
  
  const strings = interface.strings;
  
  if (interface.selectType === "none") {
    interface.infodiv.hide();
    
    return;
  }
  
  let value = "";
  
  function println(ln = "") {
    value += ln+"\n";
  }
  
  function printheader(header, ln) {
    println(header+": "+ln);
  }
  
  function printgenome() {
    println(strings.infoGenomeHeader+":");
    
    for (let y = 0; y < genomeHeight; y++) {
      value += y+": ";
      
      for (let x = 0; x < genomeWidth; x++) {
        let nstr = simulation.genome[i*genomeLength+y*genomeWidth+x].toString(16).toUpperCase();
        
        if (nstr.length < 2) nstr = "0"+nstr;
        
        value += nstr+" ";
      }
      
      println();
      println()
    }
  }
  
  const i = interface.selectType === "tile" ? interface.selectIndex:methods.cellIndexByUniq(interface.selectUniq);
  
  if (i === -1) {
    interface.selectType = "none";
    interface.changed = true;
    
    return;
  }
  
  const type = simulation.type[i];
  
  if (type > 0) {
    println(strings.infoTypes[type-1]);
    println();
    
    if (type === 1) {
      printheader(strings.infoEnergyHeader, simulation.energy[i]);
      println();
      
      for (let j = 0; j < 4; j++) {
        const shape = simulation.woodshape[i*4+j];
        
        if (shape) {
          value += strings.angleNames[j]+" ";
           
          if (shape === 0b01) value += "<-";
          if (shape === 0b10) value += "->";
          if (shape === 0b11) value += "=>";
          
          println(" "+simulation.woodgived[i*4+j]);
        }
      }
      
      println();
    }
    
    if (type === 2) {
      printgenome();
      
      printheader(strings.infoEnergyHeader, simulation.energy[i]);
      printheader(strings.infoCurrentHeader, simulation.curprog[i]+":"+simulation.current[i]+"/"+genomeWidth);
      printheader(strings.infoMutationsHeader, simulation.mutations[i]);
    }
    
    if (type === 3 || type === 4) {
      printgenome();
      
      printheader(strings.infoEnergyHeader, simulation.energy[i]);
      printheader(strings.infoCurprogHeader, simulation.curprog[i]);
      printheader(strings.infoMutationsHeader, simulation.mutations[i]);
      
      if (type === 4) printheader(strings.infoShootHeader, simulation.seedshoot[i]);
    }
    
    if (type === 5 || type === 6 || type === 7) {
      printheader(strings.infoEnergyHeader, simulation.energy[i]);
    }
    
    const k = methods.nearIndexByAngle(i, simulation.parentwood[i]);
    
    if (simulation.uniq[k] === simulation.parentwooduniq[i]) printheader(strings.infoParentHeader, strings.angleNames[simulation.parentwood[i]]);
    
    printheader(strings.infoPlaceidHeader, simulation.placeid[i]);
    printheader(strings.infoClanHeader, simulation.clan[i]);
    
    if (type !== 1) printheader(strings.infoAngleHeader, strings.angleNames[simulation.angle[i]]);
    
    println();
    println("====================");
    println();
  }
  
  printheader(strings.infoPosHeader, methods.indexX(i)+":"+methods.indexY(i));
  printheader(strings.infoOrganicHeader, simulation.organic[i]+"/"+maxOrganic);
  printheader(strings.infoChargeHeader, simulation.charge[i]+"/"+maxCharge);
  printheader(strings.infoSunHeader, methods.getSun(i));
  
  interface.info.attr("value", value);
  interface.infodiv.show();
}