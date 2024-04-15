const { language, strings } = getWindowStrings(languagesStrings);

const main = new Element("main").hide();
const setup = new Element("setup").show();

const settings = setupSettings("setup", {
    strings,
    
    record: true,
    
    onstart: start,
    
    import: function() {
        callFileSelector((file) => readFileAsBuffer(file, function(buffer) {
            setup.hide();
            
            proglabel.attr("textContent", strings.importing);
            
            progdiv.show();
            
            try {
                importSimulation(new Uint8Array(buffer), progress, function(sim) {
                    simulation = sim;
                    
                    progdiv.hide();
                    
                    simulationCreated();
                    
                    interface.pause.onclick();
                });
            } catch (e) {
                alert(strings.readFileFailed);
                
                setup.show();
            }
        }, () => alert(strings.readFileFailed)));
    }
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

new Element({
    elementType: "a",
    href: "about.html?lang="+language,
    className: "pagelink",
    textContent: strings.toAbout
}).to(new DivElement().to(setup));

setupLanguageChanger(new DivElement().to(setup), strings, language);

var simulation, interface, renderer, recorder, interval;

settings.randomSeed();

const progdiv = new DivElement().to(document.body).hide();
    
const proglabel = new Element({
    elementType: "p",
    className: "label"
}).to(progdiv);

const progress = new ProgressBar().to(progdiv);

function start() {
    const size = +settings.size.value;
    
    const reqmem = (size**2)*512;
    
    const devmem = (navigator.deviceMemory ?? 0.5)*gib/2;
    
    if (devmem <= reqmem || reqmem >= gib) if (!confirm(strings.memoryAsk(reqmem))) return;
    
    try {
        simulation = createSimulation(size, size, simulationConsts, +settings.seed.value);
    } catch (e) {
        alert(strings.noMemory);
        
        return;
    }
    
    setup.hide();
    
    const methods = simulation.methods;
    
    const charge = +settings.resources.value;
    const organic = charge/simulation.consts.organicCost;
    
    let clan = 0;
    
    proglabel.attr("textContent", strings.setupCreating);
    
    progdiv.show();
    
    function createWorld(i, callback) {
        const start = performance.now();
        
        while (performance.now()-start < 10) {
            simulation.organic[i] = organic;
            simulation.charge[i] = charge;
            
            if (methods.chance(1/(+settings.density.value))) {
                methods.putNewCellIndex(2, i);
                
                simulation.energy[i] = 20000;
                simulation.angle[i] = methods.randomInt(4);
                
                simulation.current[i] = 0;
                simulation.curprog[i] = 0;
                simulation.clan[i] = clan++;
                
                methods.copyGenome(i);
            }
            
            if (++i === simulation.type.length) {
                callback();
                
                return;
            }
        }
        
        progress.draw(i/simulation.type.length);
        
        setTimeout(() => createWorld(i, callback));
    }
    
    createWorld(0, function() {
        simulationCreated();
    });
}

function simulationCreated() {
    const size = +settings.size.value;
    
    simulation.sun = +settings.sun.value;
    
    const targetsize = 
        size == 800 ? 1600:
        size == 1800 ? 1800:1200;
    
    const framecallbacks = [
        function() {
            if (!recordstopped && settings.recordon.value && simulation.frame%(+settings.recordinterval.value) === 0) {
                recordFrame(recorder);
                
                interface.recordmem.value = filesizeString(recorder.memory)+"/"+filesizeString(recmaxsize);
                
                if (recorder.memory >= recmaxsize) {
                    interface.pause.onclick();
                    
                    alert(strings.recordMaxsizeReached);
                    
                    recmaxsize *= 2;
                }
            }
        }
    ];
    
    let curfps = 50;
    
    interface = setupInterface("main", simulation, {
        strings,
        language,
        targetsize,
        
        record: settings.recordon.value,
        
        recordsave: function() {
            if (!interface.paused) interface.pause.onclick();
            
            main.hide();
            
            proglabel.attr("textContent", strings.recordSaving);
            
            progdiv.show();
            
            downloadRecord(recorder, progress, function() {
                main.show();
                
                progdiv.hide();
            });
        },
        recordstop: function() {
            if (confirm(strings.recordStopAsk)) {
                recordstopped = true;
                
                interface.recordstop.hide();
            }
        },
        
        changeFPS: function() {
            const input = prompt(strings.fpsChange, curfps);
            
            if (input === null) return;
            if (input === "") return;
            
            let value = +input;
            
            if (isNaN(value)) return;
            
            value = Math.min(Math.max(value, 2), 250);
            
            clearInterval(interval);
            
            curfps = value;
            
            interval = startWindow([], framecallbacks, interface, simulation, renderer, curfps);
        },
        
        export: function() {
            if (!interface.paused) interface.pause.onclick();
            
            main.hide();
            
            proglabel.attr("textContent", strings.exporting);
            
            progdiv.show();
            
            exportSimulation(simulation, progress, function() {
                main.show();
                
                progdiv.hide();
            });
        }
    });
    
    renderer = createRenderer(interface, simulation, style);
    
    if (settings.recordon.value) recorder = createRecorder(simulation);
    
    let recmaxsize = +settings.recordmax.value*mib;
    let recordstopped = false;
    
    interval = startWindow([], framecallbacks, interface, simulation, renderer, curfps);
    
    main.show();
    
    progdiv.hide();
}