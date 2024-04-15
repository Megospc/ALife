function createRecorder(simulation, version = 3) {
    const data = [];
    
    const width = simulation.width;
    const height = simulation.height;
    
    const methods = getBinWriterMethods(data);
    
    const recorder = {};
    
    recorder.version = version;
    
    recorder.simulation = simulation;
    
    recorder.methods = methods;
    recorder.data = data;
    
    recorder.lastType = new Uint8Array(simulation.type.length);
    if (version >= 2) recorder.lastRes = new Uint8Array(simulation.organic.length);
    if (version >= 3) recorder.lastClan = new Uint32Array(simulation.clan.length);
    
    recorder.clanBits = 0;
    
    recorder.indexBits = Math.ceil(Math.log2(width*height));
    
    methods.write8(version);
    methods.write16(width);
    methods.write16(height);
    
    methods.write32(simulation.seed);
    
    recorder.memory = methods.compress().length;
    
    return recorder;
}

function recordFrame(recorder) {
    const simulation = recorder.simulation;
    
    const version = recorder.version;
    
    const consts = simulation.consts;
    
    const maxOrganic = consts.maxOrganic;
    const maxCharge = consts.maxCharge;
    
    const methods = recorder.methods;
    
    methods.write32(simulation.frame);
    methods.write32(simulation.population);
    
    if (version >= 3) {
        const clans = {};
        const clanTable = [];
        
        let clancount = 0;
        
        for (let i = 0; i < simulation.clan.length; i++) if (simulation.type[i] > 0) {
            const clan = simulation.clan[i];
            
            if (typeof clans[clan] === "undefined") {
                clans[clan] = clancount++;
                
                clanTable.push(clan);
            }
        }
        
        methods.write32(clancount);
        
        const clanBits = Math.ceil(Math.log2(clancount));
        
        if (clanBits !== recorder.clanBits) {
            recorder.clanBits = clanBits;
            recorder.clanTable = clanTable;
            recorder.clans = clans;
            
            for (let i = 0; i < clancount; i++) methods.write32(clanTable[i]);
        }
    }
    
    const buffer = methods.createBitbuf();
    
    let changes = 0;
    
    switch (version) {
        case 1:
            for (let i = 0; i < simulation.type.length; i++) {
                const curType = simulation.type[i];
                
                if (recorder.lastType[i] !== curType) {
                    buffer.write(i, recorder.indexBits);
                    buffer.write(curType, 3);
                    
                    recorder.lastType[i] = curType;
                    
                    changes++;
                }
            }
            
            break;
        
        case 2:
            for (let i = 0; i < simulation.type.length; i++) {
                const curType = simulation.type[i];
                const curRes = simulation.organic[i] >= maxOrganic ? 1:(simulation.charge[i] >= maxCharge ? 2:0);
                
                if (recorder.lastType[i] !== curType || recorder.lastRes[i] !== curRes) {
                    buffer.write(i, recorder.indexBits);
                    buffer.write(curType, 3);
                    buffer.write(curRes, 2);
                    
                    recorder.lastType[i] = curType;
                    recorder.lastRes[i] = curRes;
                    
                    changes++;
                }
            }
            
            break;
        
        case 3:
            for (let i = 0; i < simulation.type.length; i++) {
                const curType = simulation.type[i];
                const curRes = simulation.organic[i] >= maxOrganic ? 1:(simulation.charge[i] >= maxCharge ? 2:0);
                const curClan = simulation.clan[i];
                
                if (recorder.lastType[i] !== curType || recorder.lastRes[i] !== curRes || (recorder.lastClan[i] !== curClan && curType > 0)) {
                    buffer.write(i, recorder.indexBits);
                    buffer.write(curType, 3);
                    buffer.write(curRes, 2);
                    
                    if (curType > 0) buffer.write(recorder.clans[curClan], recorder.clanBits);
                    
                    recorder.lastType[i] = curType;
                    recorder.lastRes[i] = curRes;
                    recorder.lastClan[i] = curClan;
                    
                    changes++;
                }
            }
            
            break;
    }
    
    methods.write32(changes);
    
    buffer.end();
    
    recorder.memory += methods.compress().length;
}

function downloadRecord(recorder, progress, callback) {
    const blob = new Blob([new Uint8Array([0]), ...recorder.data], { type: "application/octet-stream" });
    
    downloadBlob(blob, "alife.alife-record");
    
    callback();
}