function createReader(data, progress, callback) {
    const methods = getBinReaderMethods(data);
    
    const reader = {};
    
    const compression = methods.read8();
    
    if (compression === 0) whenDecompressed(getBinReaderMethods(data.slice(1)));
    
    function whenDecompressed(methods) {
        const version = methods.read8();
        const width = methods.read16();
        const height = methods.read16();
        const seed = methods.read32();
        
        const simulation = createSimulation(width, height, {
            maxOrganic: 256,
            maxCharge: 256,
            
            organicCost: 1
        }, seed);
        
        reader.version = version;
        
        reader.clanBits = 0;
        
        reader.indexBits = Math.ceil(Math.log2(width*height));
        
        reader.methods = methods;
        
        reader.simulation = simulation;
        
        reader.reset = function() {
            methods.cursor(9);
            
            simulation.type.fill(0);
            simulation.organic.fill(0);
            simulation.charge.fill(0);
            simulation.clan.fill(0);
            
            reader.clanBits = 0;
            
            readFrame(reader);
        };
        
        reader.isEnd = () => methods.isEnd;
        
        callback(reader);
    }
}

function readFrame(reader) {
    const methods = reader.methods;
    const version = reader.version;
    const simulation = reader.simulation;
    
    simulation.frame = methods.read32();
    simulation.population = methods.read32();
    
    if (version >= 3) {
        const clancount = methods.read32();
        
        reader.clancount = clancount;
        
        const clanBits = Math.ceil(Math.log2(clancount));
        
        if (clanBits !== reader.clanBits) {
            reader.clanBits = clanBits;
            reader.clans = {};
            
            for (let i = 0; i < clancount; i++) reader.clans[i] = methods.read32();
        }
    }
    
    const changes = methods.read32();
    
    const buffer = methods.createBitbuf();
    
    for (let i = 0; i < changes; i++) {
        const index = buffer.read(reader.indexBits);
        
        simulation.type[index] = buffer.read(3);
        
        if (version >= 2) {
            simulation.organic[index] = buffer.readBit()*256;
            simulation.charge[index] = buffer.readBit()*256;
        }
        
        if (version >= 3 && simulation.type[index] > 0) simulation.clan[index] = reader.clans[buffer.read(reader.clanBits)];
    }
}