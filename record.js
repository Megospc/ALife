function createRecorder(simulation, version = 2) {
  const data = [];
  
  const width = simulation.width;
  const height = simulation.height;
  
  const methods = getBinWriterMethods(data);
  
  const recorder = {
    width,
    height,
    
    simulation,
    
    version,
    methods,
    data,
    
    lastType: new Uint8Array(simulation.type.length),
    lastResources: new Uint8Array(simulation.organic.length),
    lastClan: new Uint32Array(simulation.clan.length),
    
    memory: 0,
    
    indexBitsize: Math.ceil(Math.log2(width*height))
  };
  
  methods.write8(version);
  methods.write16(width);
  methods.write16(height);
  
  methods.write32(simulation.seed);
  
  recorder.memory += methods.compress().length;
  
  return recorder;
}

function recordFrame(recorder) {
  const simulation = recorder.simulation;
  
  const version = recorder.version;
  
  const indexBitsize = recorder.indexBitsize;
  
  const consts = simulation.consts;
  
  const maxOrganic = consts.maxOrganic;
  const maxCharge = consts.maxCharge;
  
  const methods = recorder.methods;
  
  methods.write32(simulation.frame);
  methods.write32(simulation.population);
  
  let clans = {};
  let clancount = 0;
  
  if (version >= 3) for (let i = 0; i < simulation.clan.length; i++) {
    const clan = simulation.clan[i];
    
    if (!clans[clan]) clans[clan] = clancount++;
  }
  
  methods.write32(clancount);
  
  const clanbits = Math.ceil(Math.log2(clancount));
  
  const buffer = methods.createBitbuf();
  
  let changes = 0;
  
  if (version >= 3) for (let i = 0; i < simulation.type.length; i++) {
    const curtype = simulation.type[i];
    const curres = simulation.organic[i] >= maxOrganic ? 1:(simulation.charge[i] >= maxCharge ? 2:0);
    const curclan = simulation.clan[i];
    
    if (recorder.lastType[i] !== curtype || recorder.lastResources[i] !== curres || recorder.lastClan[i] !== curclan) {
      buffer.write(i, indexBitsize);
      buffer.write(curtype, 3);
      buffer.write(curres, 2);
      buffer.write(clans[curclan], clanbits);
      
      recorder.lastType[i] = curtype;
      recorder.lastResources[i] = curres;
      recorder.lastClan[i] = curclan;
      
      changes++;
    }
  } else if (version >= 2) for (let i = 0; i < simulation.type.length; i++) {
    const curtype = simulation.type[i];
    const curres = simulation.organic[i] >= maxOrganic ? 1:(simulation.charge[i] >= maxCharge ? 2:0);
    
    if (recorder.lastType[i] !== curtype || recorder.lastResources[i] !== curres) {
      buffer.write(i, indexBitsize);
      buffer.write(curtype, 3);
      buffer.write(curres, 2);
      
      recorder.lastType[i] = curtype;
      recorder.lastResources[i] = curres;
      
      changes++;
    }
  } else for (let i = 0; i < simulation.type.length; i++) {
    const curtype = simulation.type[i];
    
    if (recorder.lastType[i] !== curtype) {
      buffer.write(i, indexBitsize);
      buffer.write(curtype, 3);
      
      recorder.lastType[i] = curtype;
      
      changes++;
    }
  }
  
  methods.write32(changes);
  
  buffer.end();
  
  recorder.memory += methods.compress().length;
}

function downloadRecord(recorder) {
  const blob = new Blob(recorder.data, { type: "application/octet-stream" });
  
  downloadBlob(blob, "alife.alife-record");
}