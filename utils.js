class Element {
  constructor(v) {
    if (typeof v == "string") this.element = document.getElementById(v);
    else {
      this.element = document.createElement(v.elementType);
      
      for (const key in v) if (key != "elementType") this.element[key] = v[key];
    }
  }
  
  attr(name, value) {
    if (typeof value == "undefined") return this.element[name];
    
    this.element[name] = value;
    
    return this;
  }
  
  append(elem) {
    const e = elem.element ?? elem;
    
    this.element.appendChild(e);
    
    return this;
  }
  
  to(elem) {
    const e = elem.element ?? elem;
    
    e.appendChild(this.element);
    
    return this;
  }
  
  event() {
    this.element.addEventListener(...arguments);
    
    return this;
  }
  
  show(display = "block") {
    this.element.style.display = display;
    
    return this;
  }
  hide() {
    this.element.style.display = "none";
    
    return this;
  }
  
  clientRect() {
    return this.element.getBoundingClientRect();
  }
  
  call(name, ...args) {
    return this.element[name](...args);
  }
  
  end() {
    return this.element;
  }
}

const angleX = [ 0, 1, 0, -1 ];
const angleY = [ -1, 0, 1, 0 ];

function callNearby(f) {
  f(-1, -1);
  f(0, -1);
  f(1, -1);
  f(-1, 0);
  f(0, 0);
  f(1, 0);
  f(-1, 1);
  f(0, 1);
  f(1, 1);
}

function callAngles(f, zero) {
  f(0, -1);
  f(1, 0);
  f(0, 1);
  f(-1, 0);
  
  if (zero) f(0, 0);
}

function correctAngle(angle) {
  return (angle+4) & 0b11; // Не %, для оптимизации
}
function inverseAngle(angle) {
  return (angle+2) & 0b11;
}

function getWindowStrings(strings) {
  const param = new URL(window.location.href).searchParams.get("lang");
  
  if (strings[param]) return {
    strings: strings[param],
    language: param
  };
  
  for (let i = 0; i < navigator.languages.length; i++) {
    const lang = navigator.languages[i].slice(0, 2);
    
    if (strings[lang]) return {
      strings: strings[lang],
      language: lang
    };
  }
  
  return {
    strings: strings.en,
    language: "en"
  };
}

function normalizeNumber(n, min, max, def, round) {
  n = +n;
  
  if (isNaN(n)) return def;
  
  if (round) n = Math.floor(n);
  
  return Math.min(Math.max(n, min), max);
}

function addNormalizer(el, ...args) {
  el.onchange = function() {
    this.value = normalizeNumber(this.value, ...args);
  };
}

function generateRandomSeed() {
  return Math.floor(Math.random()*2147483646)+1;
}

function randomGenerater(simulation) {
  return {
    random() {
      simulation.random = (simulation.random*16807)%2147483647;
      
      return (simulation.random-1)/2147483647;
    },
    
    randomInt(max) {
      return Math.floor(this.random()*max);
    },
    randomRange(min, max) {
      return this.randomInt(max-min)+min;
    },
    chance(chance) {
      return this.random() < chance;
    }
  };
}

function compileShader(gl, type, text) {
  const res = gl.createShader(type);
  
  gl.shaderSource(res, text);
  gl.compileShader(res);
  
  if (gl.getShaderParameter(res, gl.COMPILE_STATUS)) return res;
  else {
    const err = gl.getShaderInfoLog(res);
    
    gl.deleteShader(res);
    
    throw new Error(`can not create shader: ${err}`);
  }
}

function createProgram(gl, v, f) {
  const res = gl.createProgram();
  
  gl.attachShader(res, v);
  gl.attachShader(res, f);
  gl.linkProgram(res);
  
  return res;
}

function parseHexFragment(hex, i) {
  return parseInt(hex[i]+hex[i+1], 16);
}

function colorToHex(c) {
  const x = Math.max(Math.min(Math.floor(c), 255), 0);
  const s = x.toString(16);
  
  return x < 16 ? "0"+s:s;
}

function rgbToHex(r, g, b) {
  return "#"+colorToHex(r)+colorToHex(g)+colorToHex(b);
}

function hexToRgb(hex) {
  return [
    parseHexFragment(hex, 1),
    parseHexFragment(hex, 3),
    parseHexFragment(hex, 5)
  ];
}

function hexToVec4(hex) {
  const color = hexToRgb(hex).map(x => x/255);
  
  return "vec4("+color.join(", ")+", 1)";
}

function hexGradient(hex1, hex2, i) {
  i = Math.max(Math.min(i, 1), 0);
  
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  
  return rgbToHex(
    (r2-r1)*i+r1,
    (g2-g1)*i+g1,
    (b2-b1)*i+b1,
  );
}

function hueToRgb(h) {
  h %= 1;
  h *= 6;
  
  const v = h%1;
  
  const c = Math.floor(h);
  
  if (c === 0) return [1, v, 0];
  if (c === 1) return [1-v, 1, 0];
  if (c === 2) return [0, 1, v];
  if (c === 3) return [0, 1-v, 1];
  if (c === 4) return [v, 0, 1];
  if (c === 5) return [1, 0, 1-v];
}

function fixedString(str, length) {
  while (str.length < length) str += " ";
  
  return str;
}

function bigNumberString(n, names) {
  if (n === 0) return "0";
  if (n < 0) return "-"+bigNumberString(-n);
  
  const log = Math.floor(Math.log10(n)/3);
  
  names ??= ["", "K", "M", "B", "T", "Q"];
  
  return (n/(1000**log)).toFixed(log ? 2:0)+names[log];
}

function filesizeString(size) {
  const log = Math.floor(Math.log2(size)/10);
  
  const names = ["B", "KiB", "MiB", "GiB", "TiB"];
  
  return (size/(1024**log)).toFixed(log ? 1:0)+names[log];
}

function performanceString(cells, time) {
  time = Math.max(time, 0.1);
  
  return bigNumberString(cells/(time/1000), ["cps", "kps", "mps", "gps", "tps"]);
}

function download(src, name) {
  const a = document.createElement("a");
  
  a.href = src;
  a.download = name;
  
  a.click();
}
function downloadBlob(blob, name) {
  download(URL.createObjectURL(blob), name);
}
function downloadText(text, name) {
  const blob = new Blob([text], {
    type: "text/plain"
  });
  
  downloadBlob(blob, name);
}

function getBinWriterMethods(arr) {
  const methods = {
    data: [],
    
    write8(v) {
      this.data.push(v & 0xFF);
    },
    write16(v) {
      this.write8(v >> 8);
      this.write8(v);
    },
    write32(v) {
      this.write16(v >> 16);
      this.write16(v);
    },
    
    compress() {
      const buf = new Uint8Array(this.data);
      
      arr.push(buf);
      
      this.data = [];
      
      return buf;
    }
  };
  
  methods.createBitbuf = function() {
    return {
      data: [],
      
      curoffset: 0,
      curindex: -1,
      
      writeBit(bit) {
        if (this.curoffset === 0) this.data[++this.curindex] = 0;
        
        if (bit === 1) this.data[this.curindex] |= 1 << this.curoffset;
        
        this.curoffset = (this.curoffset+1) & 7;
      },
      
      write(v, len) {
        for (let i = 0; i < len; i++) this.writeBit((v >> i) & 1);
      },
      
      end() {
        for (let i = 0; i < this.data.length; i++) methods.write8(this.data[i]);
      }
    };
  };
  
  return methods;
}

function getBinReaderMethods(arr) {
  const methods = {
    index: 0,
    
    read8() {
      return arr[this.index++];
    },
    read16() {
      return (this.read8() << 8) + this.read8();
    },
    read32() {
      return (this.read16() << 16) + this.read16();
    },
    
    cursor(index) {
      this.index = index;
    },
    
    get isEnd() {
      return this.index >= arr.length-1;
    }
  };
  
  methods.createBitbuf = function() {
    return {
      curoffset: 0,
      curvalue: 0,
      
      readBit() {
        if (this.curoffset === 0) this.curvalue = methods.read8();
        
        const v = (this.curvalue >> this.curoffset) & 1;
        
        this.curoffset = (this.curoffset+1) & 7;
        
        return v;
      },
      
      read(len) {
        let v = 0;
        
        let i = 0;
        
        for (let i = 0; i < len; i++) v += this.readBit() << i;
        
        return v;
      }
    };
  };
  
  return methods;
}

const benchmarkOn = false;

var benchmarkName;
var benchmarkStarted;

function startBenchmark(name) {
  if (benchmarkOn) benchmarkStarted = performance.now();
  
  benchmarkName = name;
}

function closeBenchmark() {
  if (benchmarkOn) {
    const time = performance.now()-benchmarkStarted;
    
    console.log(fixedString(benchmarkName, 20)+": "+time.toFixed(2)+"ms");
  }
}

function clearBenchmark() {
  if (benchmarkOn) console.clear();
}

class InputElement extends Element {
  constructor(type, name) {
    super({
      elementType: "div",
      className: "div"
    });
    
    this.label = new Element({
      elementType: "label",
      className: "label",
      textContent: name+": "
    }).to(this.element).end();
    
    this.input = new Element({
      elementType: "input",
      className: "input",
      type
    }).to(this.element).end();
  }
  
  get value() {
    return +this.input.value;
  }
  set value(v) {
    this.input.value = v;
  }
}

class CheckInput extends Element {
  constructor(name, def) {
    super({
      elementType: "div",
      className: "div"
    });
    
    this.input = new Element({
      elementType: "input",
      className: "input",
      type: "checkbox"
    }).to(this.element).end();
    
    this.label = new Element({
      elementType: "label",
      className: "label",
      textContent: name,
      onclick: () => this.input.click()
    }).to(this.element).end();
    
    this.value = def;
  }
  
  get value() {
    return this.input.checked;
  }
  set value(v) {
    this.input.checked = v;
  }
}

class SelectElement extends Element {
  constructor(name, cases, def) {
    super({
      elementType: "div",
      className: "div"
    });
    
    this.label = new Element({
      elementType: "label",
      className: "label",
      textContent: name+": "
    }).to(this.element).end();
    
    this.select = new Element({
      elementType: "select",
      className: "select",
      innerHTML: cases.map(x => `<option value="${x[0]}">${x[1]}</option>`).join("\n")
    }).to(this.element).end();
    
    this.value = def;
  }
  
  get value() {
    return this.select.value;
  }
  set value(v) {
    this.select.value = v;
  }
}


class NumberInput extends InputElement {
  constructor(name, min, max, def, round) {
    super("number", name);
    
    addNormalizer(this.input, min, max, def, round);
    
    this.value = def;
  }
}

class RangeInput extends InputElement {
  constructor(name, min, max, def) {
    super("range", name);
    
    this.input.min = min;
    this.input.max = max;
    
    this.value = def;
  }
}

class StatElement extends Element {
  constructor(name, def, pfix = "") {
    super({
      elementType: "p",
      className: "stat",
      textContent: name+": "+def
    });
    
    this.name = name;
    this.pfix = pfix;
  }
  
  set value(v) {
    this.element.textContent = this.name+": "+v+this.pfix;
  }
}

class ButtonElement extends Element {
  constructor(name, onclick, className = "button") {
    super({
      elementType: "button",
      textContent: name,
      className
    });
    
    this.onclick = onclick;
    
    this.element.onclick = () => this.onclick();
  }
}

class DivElement extends Element {
  constructor(className = "div") {
    super({
      elementType: "div",
      className
    });
  }
}