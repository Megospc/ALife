function setupInterface(main, simulation, props = {}) {
  const obj = {
    simulation,
    
    paused: false,
    cameraX: 0,
    cameraY: 0,
    showCenter: false,
    changed: true,
    
    selectType: "none",
    selectUniq: -1,
    selectIndex: -1,
    
    strings: props.strings,
    language: props.language
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
  
  if (props.framereset) obj.framereset = new ButtonElement(strings.recordReset, props.framereset).to(obj.topbuttons);
  
  obj.topstats = new DivElement().to(obj.main);
  obj.frame = new StatElement(strings.iteration, 0).to(obj.topstats);
  obj.population = new StatElement(strings.population, 0).to(obj.topstats);
  obj.fps = new StatElement(strings.fps, 0).attr("onclick", props.changeFPS ?? (() => {})).to(obj.topstats);
  
  obj.themes = new DivElement().to(obj.main);
  obj.theme = new SelectElement(strings.rendermodeHeader, [
    ["default", strings.rendermodeValues[0]],
    ["energy", strings.rendermodeValues[1]],
    ["contrast", strings.rendermodeValues[2]],
    ["clan", strings.rendermodeValues[3]],
    ["nothing", strings.rendermodeValues[4]]
  ], "default").attr("onchange", () => obj.changed = true).to(obj.themes);
  obj.backtheme = new SelectElement(strings.groundmodeHeader, [
    ["default", strings.groundmodeValues[0]],
    ["poisons", strings.groundmodeValues[1]],
    ["organic", strings.groundmodeValues[2]],
    ["charge", strings.groundmodeValues[3]],
    ["nothing", strings.groundmodeValues[4]]
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
  obj.infosave = new ButtonElement(strings.infoSave, function() {
    sessionStorage.setItem("alife-save", interface.selectJSON);
    
    window.open("sandbox.html?lang="+obj.language);
  }).to(obj.infobtns);
  
  if (props.bottomstats ?? true) {
    obj.bottomstats = new DivElement().to(obj.undercanvas);
    
    if (props.worldenergy ?? true) {
      obj.energydiv = new DivElement().to(obj.bottomstats);
      obj.energyorganic = new StatElement(strings.energyOrganic, 0).to(obj.energydiv);
      obj.energycharge = new StatElement(strings.energyCharge, 0).to(obj.energydiv);
      obj.energyenergy = new StatElement(strings.energyEnergy, 0).to(obj.energydiv);
      obj.energysum = new StatElement(strings.energySum, 0).to(obj.energydiv);
    }
    
    obj.clancountdiv = new DivElement().to(obj.bottomstats);
    obj.clancount = new StatElement(strings.clancount, 0).to(obj.clancountdiv);
  }
  
  obj.renderoff = new CheckInput(strings.renderoff, false).to(obj.undercanvas);
  obj.rendertime = new StatElement(strings.rendertime, 0, strings.ms).to(obj.undercanvas);
  obj.handletime = new StatElement(strings.handletime, 0, strings.ms).to(obj.undercanvas);
  obj.performance = new StatElement(strings.performance, 0).to(obj.undercanvas);
  obj.seed = new StatElement(strings.seed, simulation.seed).to(obj.undercanvas);
  
  if (props.export) {
    obj.exportdiv = new DivElement().to(obj.undercanvas);
    
    obj.export = new ButtonElement(strings.export, props.export).to(obj.exportdiv);
  }
  
  if (props.record) {
    obj.recorddiv = new DivElement().to(obj.undercanvas);
    
    obj.recordmem = new StatElement(strings.recordMemory, "").to(obj.recorddiv);
    
    obj.recordbtns = new DivElement().to(obj.recorddiv);
    
    obj.recordsave = new ButtonElement(strings.recordSave, props.recordsave).to(obj.recordbtns);
    obj.recordstop = new ButtonElement(strings.recordStop, props.recordstop).to(obj.recordbtns);
  }
  
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
    
    props.keys ??= true;
    
    if (props.keys) document.addEventListener("keydown", e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      let prevent = true;
      
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
        
        default:
          prevent = false;
      }
      
      if (e.code.includes("Digit")) {
        const v = +e.code[5];
        
        if (seltheme && v < 5) obj.theme.value = ["nothing", "default", "energy", "contrast", "clan"][v];
        if (selbacktheme && v < 5) obj.backtheme.value = ["nothing", "default", "poisons", "organic", "charge"][v];
        
        obj.changed = true;
      }
      
      if (prevent) e.preventDefault();
    });
    
    if (props.keys) document.addEventListener("keyup", e => {
      let prevent = true;
      
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
        
        default:
          prevent = false;
      }
      
      if (prevent) e.preventDefault();
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
    elementType: props.header ?? "h1",
    textContent: strings.setupHeader,
    className: "header"
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
  ], 500).to(obj.main);
  
  obj.density = new SelectElement(strings.setupDensityHeader, [
    [3, strings.setupDensityValues[0]],
    [4, strings.setupDensityValues[1]],
    [6, strings.setupDensityValues[2]],
    [9, strings.setupDensityValues[3]],
    [16, strings.setupDensityValues[4]],
    [25, strings.setupDensityValues[5]],
    [36, strings.setupDensityValues[6]],
    [50, strings.setupDensityValues[7]],
  ], 9).to(obj.main);
  
  obj.resources = new SelectElement(strings.setupResourcesHeader, [
    [1000, strings.setupResourcesValues[0]],
    [2000, strings.setupResourcesValues[1]],
    [5000, strings.setupResourcesValues[2]],
    [10000, strings.setupResourcesValues[3]],
    [20000, strings.setupResourcesValues[4]],
    [30000, strings.setupResourcesValues[5]],
    [40000, strings.setupResourcesValues[6]],
    [48000, strings.setupResourcesValues[7]]
  ], 10000).to(obj.main);
  
  if (props.prog) obj.prog = new SelectElement(strings.setupProgHeader,
    new Array(props.prog).fill(0).map((x, i) => [i, i.toString(16).toUpperCase()])
  , 0).to(obj.main);
  
  if (props.record) {
    obj.recordheader = new Element({
      elementType: "h3",
      textContent: strings.recordSettings,
      className: "header"
    }).to(obj.main);
    
    obj.recordon = new CheckInput(strings.recordOnHeader, false).to(obj.main);
    
    obj.recordinterval = new NumberInput(strings.recordIntervalHeader, 1, 500, 5, true).to(obj.main);
    obj.recordmax = new NumberInput(strings.recordMaxsizeHeader, 1, 1000, 50, true).to(obj.main);
  }
  
  obj.buttons = new DivElement().to(obj.main);
  
  obj.start = new ButtonElement(strings.setupStart, props.onstart).to(obj.buttons);
  
  if (props.import) obj.import = new ButtonElement(strings.import, props.import).to(obj.buttons);
  
  obj.randomSeed = function() {
    obj.seed.value = generateRandomSeed();
  };
  
  return obj;
}

function setupLanguageChanger(main, strings, language) {
  main.attr("className", "langdiv");
  
  new Element({
    elementType: "label",
    textContent: strings.language+": ",
    className: "label"
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

function startWindow(startCallbacks, frameCallbacks, interface, simulation, renderer, fps = 40) {
  for (let i = 0; i < startCallbacks.length; i++) startCallbacks[i]();
  
  let lastTime = performance.now();
  let lastRenderedFrame = -1;
  let lastRenderedZoom = -1;
  let lastHandleFrame = 0;
  let frame = 0;
  
  return setInterval(() => {
    const renderstart = performance.now();
    
    if (interface.renderoff.value) {
      interface.canvasdiv.hide();
      
      if (interface.energydiv) interface.energydiv.hide();
      
      if (interface.clancountdiv) interface.clancountdiv.hide();
    } else {
      interface.canvasdiv.show();
      if (interface.energydiv) interface.energydiv.show();
      
      const zoom = interface.getZoom();
      
      if (interface.energydiv && lastRenderedFrame !== simulation.frame) updateSimulationEnergy(interface);
      
      if (interface.changed || lastRenderedFrame !== simulation.frame || lastRenderedZoom !== zoom) {
        const { clancount } = render(renderer);
        
        if (interface.clancountdiv) {
          if (interface.theme.value === "clan") {
            interface.clancount.value = clancount;
            
            interface.clancountdiv.show();
          } else interface.clancountdiv.hide();
        }
        
        lastRenderedFrame = simulation.frame;
        lastRenderedZoom = zoom;
        
        interface.changed = false;
      }
    }
    
    updateSelectInfo(interface);
    
    const rendertime = performance.now()-renderstart;
    
    const handlestart = performance.now();
    
    if (!interface.paused && (frame-lastHandleFrame) >= (20-interface.speed.value)) {
      iteration(simulation);
      
      lastHandleFrame = frame;
      
      for (let i = 0; i < frameCallbacks.length; i++) frameCallbacks[i]();
    }
    
    const handletime = performance.now()-handlestart;
    
    interface.frame.value = simulation.frame;
    interface.population.value = simulation.population;
    
    interface.rendertime.value = Math.ceil(rendertime);
    interface.handletime.value = Math.ceil(handletime);
    
    if (simulation.population === 0) interface.performance.value = "0cps";
    else interface.performance.value = performanceString(simulation.population, handletime);
    
    frame++;
    
    if (frame%10 === 0) {
      const time = performance.now();
      
      interface.fps.value = (1000/(time-lastTime)*10).toFixed(1);
      
      lastTime = time;
    }
  }, 1000/fps);
}

function updateSimulationEnergy(interface) {
  const simulation = interface.simulation;
  
  const consts = simulation.consts;
  
  const organicCost = consts.organicCost;
  
  let organic = 0;
  let charge = 0;
  let energy = 0;
  
  for (let i = 0; i < simulation.energy.length; i++) {
    if (simulation.type[i]) energy += simulation.energy[i]+organicCost*9;
    
    organic += simulation.organic[i]*organicCost;
    charge += simulation.charge[i];
  }
  
  const sum = organic+charge+energy;
  
  interface.energyorganic.value = bigNumberString(organic);
  interface.energycharge.value = bigNumberString(charge);
  interface.energyenergy.value = bigNumberString(energy);
  interface.energysum.value = bigNumberString(sum);
}

function exportSimulation(simulation, progress, callback) {
  const consts = simulation.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeWidth*genomeHeight;
  
  const bitsToBytes = bits => Math.ceil(bits/8);
  const valuesToBits = values => Math.ceil(Math.log2(values));
  
  const headerObject = {
    version: 1,
    
    consts,
    
    width: simulation.width,
    height: simulation.height,
    
    seed: simulation.seed,
    random: simulation.random,
    
    frame: simulation.frame,
    population: simulation.population,
    lastUniq: simulation.lastUniq,
    
    sun: simulation.sun
  };
  
  const headerJSON = JSON.stringify(headerObject);
  
  const headerData = encodeText(headerJSON);
  
  const data = [];
  
  const methods = getBinWriterMethods(data);
  
  methods.write32(headerData.length);
  
  for (let i = 0; i < headerData.length; i++) methods.write8(headerData[i]);
  
  const two32 = 2**32;
  
  function writeUniq(uniq) {
    methods.write32(uniq >> 0);
    methods.write32(uniq/two32);
  }
  
  function write(i) {
    const start = performance.now();
    
    while (performance.now()-start < 10) {
      methods.write32(simulation.organic[i]);
      methods.write32(simulation.charge[i]);
      
      const type = simulation.type[i];
      
      methods.write8(type);
      
      if (type > 0) {
        methods.write8(simulation.angle[i]);
        methods.write32(simulation.energy[i]);
        methods.write32(simulation.clan[i]);
        
        writeUniq(simulation.uniq[i]);
        
        if (type === 1) {
          const i4 = i << 2;
          
          for (let j = 0; j < 4; j++) {
            methods.write8(simulation.woodshape[i4+j]);
            
            writeUniq(simulation.wooduniqs[i4+j]);
          }
          
          methods.write8(simulation.woodinfo[i]);
        }
        
        methods.write8(simulation.parentwood[i]);
        
        writeUniq(simulation.parentwooduniq[i]);
        
        if (type === 2 || type === 3 || type === 4) {
          if (type === 2) methods.write8(simulation.current[i]);
          
          methods.write8(simulation.curprog[i]);
          
          methods.write32(simulation.mutations[i]);
          
          if (type === 4) methods.write8(simulation.seedshoot[i]);
          
          const ig = i*genomeLength;
          
          for (let j = 0; j < genomeLength; j++) methods.write8(simulation.genome[ig+j]);
        }
        
        methods.write32(simulation.placeid[i]);
      }
      
      if (++i === simulation.type.length) {
        final();
        
        return;
      }
    }
    
    progress.draw(i/simulation.type.length);
    
    setTimeout(() => write(i));
  }
  
  write(0);
  
  function final() {
    for (let i = 1; i < simulation.emptyPlaces.length; i++) {
      const arr = simulation.emptyPlaces[i];
      
      methods.write32(arr.length);
      
      for (let j = 0; j < arr.length; j++) methods.write32(arr[j]);
    }
    
    methods.compress();
    
    const blob = new Blob(data, { type: "application/octet-stream" });
    
    downloadBlob(blob, "alife.alife-frame");
    
    callback();
  }
}

function importSimulation(data, progress, callback) {
  const methods = getBinReaderMethods(data);
  
  const length = methods.read32();
  
  const headerJSON = decodeText(data.slice(4, length+4));
  
  const headerObject = JSON.parse(headerJSON);
  
  methods.cursor(length+4);
  
  const consts = headerObject.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeWidth*genomeHeight;
  
  const simulation = createSimulation(headerObject.width, headerObject.height, consts, headerObject.seed);
  
  simulation.random = headerObject.random;
  simulation.frame = headerObject.frame;
  simulation.population = headerObject.population;
  simulation.lastUniq = headerObject.lastUniq;
  simulation.sun = headerObject.sun;
  
  const two32 = 2**32;
  
  function readUniq() {
    return methods.read32()+methods.read32()*two32;
  }
  
  function read(i) {
    const start = performance.now();
    
    while (performance.now()-start < 10) {
      simulation.organic[i] = methods.read32();
      simulation.charge[i] = methods.read32();
      
      const type = methods.read8();
      
      simulation.type[i] = type;
      
      if (type > 0) {
        simulation.angle[i] = methods.read8();
        
        simulation.energy[i] = methods.read32();
        simulation.clan[i] = methods.read32();
        
        simulation.uniq[i] = readUniq();
        
        if (type === 1) {
          const i4 = i << 2;
          
          for (let j = 0; j < 4; j++) {
            simulation.woodshape[i4+j] = methods.read8();
            simulation.wooduniqs[i4+j] = readUniq();
          }
          
          simulation.woodinfo[i] = methods.read8();
        }
        
        simulation.parentwood[i] = methods.read8();
        simulation.parentwooduniq[i] = readUniq();
        
        if (type === 2 || type === 3 || type === 4) {
          if (type === 2) simulation.current[i] = methods.read8();
          
          simulation.curprog[i] = methods.read8();
          
          simulation.mutations[i] = methods.read32();
          
          if (type === 4) simulation.seedshoot[i] = methods.read8();
          
          const ig = i*genomeLength;
          
          for (let j = 0; j < genomeLength; j++) simulation.genome[ig+j] = methods.read8();
        }
        
        simulation.placeid[i] = methods.read32();
        
        simulation.arr[type][simulation.placeid[i]] = i;
      }
      
      if (++i === simulation.type.length) {
        final();
        
        return;
      }
    }
    
    progress.draw(i/simulation.type.length);
    
    setTimeout(() => read(i));
  }
  
  read(0);
  
  function final() {
    for (let i = 1; i < simulation.arr.length; i++) {
      const length = methods.read32();
      
      for (let j = 0; j < length; j++) {
        const v = methods.read32();
        
        simulation.arr[i][v] = -1;
        simulation.emptyPlaces[i].push(v);
      }
    }
    
    callback(simulation);
  }
}

function updateSelectInfo(interface) {
  const simulation = interface.simulation;
  
  const methods = simulation.methods;
  
  const consts = simulation.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeHeight*genomeWidth;
  
  const woodInfoTransfer = consts.woodInfoTransfer;
  
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
      value += y.toString(16).toUpperCase()+": ";
      
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
  
  if (type === 2 || type === 3 || type === 4) {
    interface.selectJSON = JSON.stringify({
      name: "",
      description: "",
      
      genome: [...simulation.genome.slice(i*genomeLength, (i+1)*genomeLength)],
      consts: simulation.consts,
      
      settings: {
        sun: simulation.sun,
        prog: simulation.curprog[i]
      },
      
      createdDate: Date.now(),
    });
    
    interface.infosave.show("inline");
  } else interface.infosave.hide();
  
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
      
      if (woodInfoTransfer) printheader(strings.infoWoodinfoHeader, simulation.woodinfo[i]);
    }
    
    if (type === 2) {
      printgenome();
      
      printheader(strings.infoEnergyHeader, simulation.energy[i]+"/"+sproutFallEnergy);
      printheader(strings.infoCurrentHeader, simulation.curprog[i]+":"+simulation.current[i]+"/"+genomeWidth);
      printheader(strings.infoMutationsHeader, simulation.mutations[i]);
    }
    
    if (type === 3 || type === 4) {
      printgenome();
      
      printheader(strings.infoEnergyHeader, simulation.energy[i]+"/"+seedFallEnergy);
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
    printheader(strings.infoUniqHeader, simulation.uniq[i]);
    
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