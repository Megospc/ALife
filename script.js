const { language, strings } = getWindowStrings(languagesStrings);

const main = new Element("main").hide();
const setup = new Element("setup").show();

const settings = setupSettings("setup", {
  strings,
  
  onstart: start
});

new Element({
  elementType: "a",
  href: "sandbox.html?lang="+language,
  className: "pagelink",
  textContent: strings.toSandbox
}).to(setup);

setupLanguageChanger(new DivElement().to(setup), strings, language);

var simulation, interface, renderer;

settings.randomSeed();

const frameCallbacks = [];
const startCallbacks = [];

const simulationConsts = {};

function start() {
  const size = +settings.size.value;
  
  const reqmem = (size**2)*512;
  
  const gib = 2**30;
  
  const devmem = (navigator.deviceMemory ?? 0.5)*gib/2;
  
  if (devmem <= reqmem || reqmem >= gib) if (!confirm(strings.memoryAsk(reqmem))) return;
  
  simulation = createSimulation(size, size, simulationConsts, settings.seed.value);
  
  const methods = simulation.methods;
  
  for (let i = 0, clan = 0; i < simulation.type.length; i++) {
    if (!methods.chance(1/settings.density.value)) continue;
    
    methods.putNewCellIndex(2, i);
    
    simulation.energy[i] = 20000;
    simulation.angle[i] = methods.randomInt(4);
    
    simulation.current[i] = 0;
    simulation.curprog[i] = 0;
    simulation.clan[i] = clan++;
    
    methods.copyGenome(i);
  }
  
  const charge = settings.resources.value;
  const organic = charge/simulation.consts.organicCost;
  
  for (let i = 0; i < simulation.organic.length; i++) simulation.organic[i] = organic;
  for (let i = 0; i < simulation.charge.length; i++) simulation.charge[i] = charge;
  
  simulation.sun = settings.sun.value;
  
  const targetsize = 
    size == 800 ? 1600:
    size == 1800 ? 1800:1200;
  
  interface = setupInterface("main", simulation, {
    strings,
    language,
    targetsize
  });
  
  renderer = createRenderer(interface, simulation, style);
  
  startWindow(startCallbacks, frameCallbacks, interface, simulation, renderer);
  
  setup.hide();
  main.show();
}