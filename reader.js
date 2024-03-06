function createReader(data) {
  const methods = getBinReaderMethods(data);
  
  const version = methods.read8();
  const width = methods.read16();
  const height = methods.read16();
  const seed = methods.read32();
  
  const simulation = createSimulation(width, height, {
    maxOrganic: 1,
    maxCharge: 1
  }, seed);
  
  const reader = {
    width,
    height,
    
    methods,
    
    simulation,
    
    version,
    methods,
    data,
    
    indexBitsize: Math.ceil(Math.log2(width*height)),
    
    reset() {
      methods.cursor(9);
      
      simulation.type.fill(0);
      simulation.organic.fill(0);
      simulation.charge.fill(0);
      simulation.clan.fill(0);
    },
    
    get isEnd() {
      return methods.isEnd;
    }
  };
  
  return reader;
}

function readFrame(reader) {
  const simulation = reader.simulation;
  
  const version = reader.version;
  
  const indexBitsize = reader.indexBitsize;
  
  const methods = reader.methods;
  
  simulation.frame = methods.read32();
  simulation.population = methods.read32();
  
  const clancount = methods.read32();
  
  const changes = methods.read32();
  
  const buffer = methods.createBitbuf();
  
  if (version >= 3) {
    const clanbits = Math.ceil(Math.log2(clancount));
    
    for (let i = 0; i < changes; i++) {
      const index = buffer.read(indexBitsize);
      
      simulation.type[index] = buffer.read(3);
      
      simulation.organic[index] = buffer.readBit();
      simulation.charge[index] = buffer.readBit();
      
      simulation.clan[index] = buffer.read(clanbits);
    }
  } else if (version >= 2) for (let i = 0; i < changes; i++) {
    const index = buffer.read(indexBitsize);
    
    simulation.type[index] = buffer.read(3);
    
    simulation.organic[index] = buffer.readBit();
    simulation.charge[index] = buffer.readBit();
  } else for (let i = 0; i < changes; i++) simulation.type[buffer.read(indexBitsize)] = buffer.read(3);
}