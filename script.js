const { language, strings } = getWindowStrings(languagesStrings);

const main = new Element("main").hide();
const setup = new Element("setup").show();

const settings = setupSettings("setup", {
  strings,
  
  record: true,
  
  onstart: start
});

new Element({
  elementType: "a",
  href: "sandbox.html?lang="+language,
  className: "pagelink",
  textContent: strings.toSandbox
}).to(new DivElement().to(setup));

new Element({
  elementType: "a",
  href: "record.html?lang="+language,
  className: "pagelink",
  textContent: strings.toRecord
}).to(new DivElement().to(setup));

setupLanguageChanger(new DivElement().to(setup), strings, language);

var simulation, interface, renderer, recorder;

settings.randomSeed();

const simulationConsts = {
  rootCost: 2500,
  aerialCost: 2500,
  leafCost: 4000,
  
  woodInfoTransfer: 3,
  
  sproutEatEnergyPart: 0.8,
  sproutCommandsV2: true,
  
  seedShootCanKillNearby: true,
  
  genomeHeight: 7,
  genomeWidth: 40,
  
  sproutDefaultProg: 2
};

function start() {
  const size = +settings.size.value;
  
  const reqmem = (size**2)*512;
  
  const mib = 1024*1024;
  const gib = mib*1024;
  
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
    targetsize,
    
    record: settings.recordon.value,
    
    recordsave: function() {
      downloadRecord(recorder);
    },
    recordstop: function() {
      if (confirm(strings.recordStopAsk)) {
        recordstopped = true;
        
        interface.recordstop.hide();
      }
    }
  });
  
  renderer = createRenderer(interface, simulation, style);
  
  if (settings.recordon.value) recorder = createRecorder(simulation);
  
  let recmaxsize = settings.recordmax.value*mib;
  let recordstopped = false;
  
  startWindow([], [
    function() {
      if (!recordstopped && settings.recordon.value && simulation.frame%settings.recordinterval.value === 0) {
        recordFrame(recorder);
        
        interface.recordmem.value = filesizeString(recorder.memory)+"/"+filesizeString(recmaxsize);
        
        if (recorder.memory >= recmaxsize) {
          interface.pause.onclick();
          
          alert(strings.recordMaxsizeReached);
          
          recmaxsize *= 2;
        }
      }
    }
  ], interface, simulation, renderer);
  
  setup.hide();
  main.show();
}