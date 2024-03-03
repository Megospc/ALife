/*************************
* ТИПЫ КЛЕТОК:
* 0 = ПУСТО
* 1 = СОСУД
* 2 = ОТРОСТОК
* 3 = СЕМЕЧКО
* 4 = СЕМЕЧКО С ОТСТРЕЛОМ
* 5 = ЛИСТ
* 6 = КОРЕНЬ
* 7 = АНТЕННА
*************************/

function getSimulationMethods(simulation) {
  const consts = simulation.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeWidth*genomeHeight;
  
  const maxOrganic = consts.maxOrganic;
  const maxCharge = consts.maxCharge;
  
  const mutationChance = consts.mutationChance;
  
  const deathOnPotionDestroysIt = consts.deathOnPotionDestroysIt;
  
  return {
    ...randomGenerater(simulation), // Методы рандома
    
    registerNewCell(i, type, changeuniq) {
      const arr = simulation.arr[type];
      
      const placeid = simulation.emptyPlaces[type].pop() ?? arr.length; // Свободное место
      
      arr[placeid] = i;
      
      simulation.placeid[i] = placeid;
      simulation.isNew[i] = 1;
      simulation.isDead[i] = 0;
      
      simulation.news.push(i);
      
      if (changeuniq) simulation.uniq[i] = simulation.lastUniq++;
      
      simulation.population++;
      
      return simulation.uniq[i];
    },
    
    putNewCell(type, x, y, changeuniq = true) {
      const i = x+y*simulation.width;
      
      simulation.type[i] = type;
      
      const uniq = this.registerNewCell(i, type, changeuniq);
      
      return {
        index: i,
        uniq
      };
    },
    putNewCellIndex(type, i, changeuniq = true) {
      simulation.type[i] = type;
      
      return this.registerNewCell(i, type,changeuniq);
    },
    
    deleteCell(i) {
      const type = simulation.type[i];
      const placeid = simulation.placeid[i];
      
      simulation.arr[type][placeid] = -1;
      simulation.emptyPlaces[type].push(placeid);
      
      simulation.population--;
    },
    
    eachCellOfType(name, types, f) {
      startBenchmark(name);
      
      for (let i = 0; i < types.length; i++) {
        const arr = simulation.arr[types[i]];
        
        for (let j = 0; j < arr.length; j++) {
          const v = arr[j];
          
          if (v >= 0 && !simulation.isNew[v] && !simulation.isDead[v]) f(v);
        }
      }
      
      closeBenchmark();
    },
    
    copyGenome(target, source = -1, mutprob = mutationChance) {
      const i = target*genomeLength;
      
      if (source >= 0) {
        const k = source*genomeLength;
        
        for (let j = 0; j < genomeLength; j++) simulation.genome[i+j] = simulation.genome[k+j];
        
        if (this.chance(mutprob)) { // Мутация
          simulation.genome[i+this.randomInt(genomeLength)] = this.randomInt(256);
          
          simulation.mutations[target] = simulation.mutations[source]+1;
        } else simulation.mutations[target] = simulation.mutations[source];
      } else for (let j = 0; j < genomeLength; j++) simulation.genome[i+j] = this.randomInt(256); // Случайный геном
    },
    
    posIndex(x, y) {
      if (x < 0) x += simulation.width;
      if (x >= simulation.width) x -= simulation.width;
      if (y < 0) y += simulation.height;
      if (y >= simulation.height) y -= simulation.height;
      
      return x+y*simulation.width;
    },
    
    indexX(i) {
      return i%simulation.width;
    },
    indexY(i) {
      return Math.floor(i/simulation.width);
    },
    
    nearIndexByAngle(i, angle) {
      return this.posIndex(this.indexX(i)+angleX[angle], this.indexY(i)+angleY[angle]);
    },
    
    getSun(i) {
      return Math.floor(simulation.sun*simulation.organic[i]/maxOrganic);
    },
    
    addResource(data, i, add) {
      const cx = this.indexX(i);
      const cy = this.indexY(i);
      
      const f = (x, y) => {
        const j = this.posIndex(cx+x, cy+y);
        
        if (data[j]+add >= 0) data[j] += add;
        
        if (simulation.type[j] > 0) this.deadByPotionTest(j);
      };
      
      f(-1, -1);
      f(0, -1);
      f(1, -1);
      f(-1, 0);
      f(0, 0);
      f(1, 0);
      f(-1, 1);
      f(0, 1);
      f(1, 1);
    },
    
    moveCell(i, k) {
      simulation.arr[simulation.type[i]][simulation.placeid[i]] = k;
      
      simulation.isDead[k] = 0;
      
      simulation.placeid[k] = simulation.placeid[i];
      simulation.uniq[k] = simulation.uniq[i];
      simulation.type[k] = simulation.type[i];
      simulation.angle[k] = simulation.angle[i];
      simulation.clan[k] = simulation.clan[i];
      
      simulation.type[i] = 0;
      simulation.uniq[i] = 0;
    },
    
    deadByPotionTest(i) {
      if (simulation.organic[i] >= maxOrganic) {
        if (simulation.type[i] !== 6) this.dead(i, deathOnPotionDestroysIt ? -1:1);
      } else if (simulation.charge[i] >= maxCharge && simulation.type[i] !== 7) this.dead(i);
    },
    
    dead(i, organic = 1) {
      if (!simulation.isDead[i]) {
        simulation.deaths.push(i);
        simulation.deaths.push(organic);
        
        simulation.isDead[i] = 1;
      }
    },
    
    isCellByLinkAlive(i, angle, uniq) {
      const k = this.nearIndexByAngle(i, angle);
      
      return simulation.type[k] > 0 && simulation.uniq[k] === uniq && simulation.isDead[k] === 0;
    },
    
    cellIndexByUniq(uniq) {
      for (let i = 0; i < simulation.arr.length; i++) {
        const arr = simulation.arr[i];
        
        for (let j = 0; j < arr.length; j++) {
          const v = arr[j];
          
          if (v >= 0 && simulation.uniq[v] === uniq) return v;
        }
      }
      
      return -1;
    }
  };
}

function iteration(simulation) {
  const methods = simulation.methods;
  const consts = simulation.consts;
  
  const genomeWidth = consts.genomeWidth;
  const genomeHeight = consts.genomeHeight;
  const genomeLength = genomeWidth*genomeHeight;
  
  const maxOrganic = consts.maxOrganic;
  const addOrganic = consts.addOrganic;
  const organicCost = consts.organicCost;
  const organicMoving = consts.organicMoving;
  
  const maxCharge = consts.maxCharge;
  const chargeAvg = consts.chargeAvg;
  const chargeStep = consts.chargeStep;
  const chargeNoUp = consts.chargeNoUp;
  
  const woodConsumption = consts.woodConsumption;
  const woodInfoTransfer = consts.woodInfoTransfer;
  
  const sproutCost = consts.sproutCost;
  const sproutConsumption = consts.sproutConsumption;
  const sproutFallEnergy = consts.sproutFallEnergy;
  const sproutOrganicEat = consts.sproutOrganicEat;
  
  const sproutCommandsV2 = consts.sproutCommandsV2;
  
  const seedCost = consts.seedCost;
  const seedConsumption = consts.seedConsumption;
  const seedFallEnergy = consts.seedFallEnergy;
  
  const seedShootDistance = consts.seedShootDistance;
  const seedShootBaseCost = consts.seedShootBaseCost;
  const seedShootDistanceCost = consts.seedShootDistanceCost;
  
  const leafCost = consts.leafCost;
  const leafInitial = consts.leafInitial;
  const leafConsumption = consts.leafConsumption;
  const leafMaxNears = consts.leafMaxNears;
  
  const rootCost = consts.rootCost;
  const rootInitial = consts.rootInitial;
  const rootConsumption = consts.rootConsumption;
  const rootSpeed = consts.rootSpeed;
  
  const aerialCost = consts.aerialCost;
  const aerialInitial = consts.aerialInitial;
  const aerialConsumption = consts.aerialConsumption;
  const aerialSpeed = consts.aerialSpeed;
  
  const producerAvg = consts.producerAvg;
  
  const energyUnit = consts.energyUnit;
  
  const commandsPerStep = 5;
  
  const sorganic = simulation.organic;
  const scharge = simulation.charge;
  
  const puniq = simulation.uniq;
  const ptype = simulation.type;
  const pclan = simulation.clan;
  const penergy = simulation.energy;
  const pnenergy = simulation.nenergy;
  const pangle = simulation.angle;
  const pcurrent = simulation.current;
  const pcurprog = simulation.curprog;
  const pgenome = simulation.genome;
  const pseedshoot = simulation.seedshoot;
  
  const pwoodshape = simulation.woodshape;
  const pwooduniqs = simulation.wooduniqs;
  const pwoodgived = simulation.woodgived;
  const pparentwood = simulation.parentwood;
  const pparentwooduniq = simulation.parentwooduniq;
  const pwoodinfo = simulation.woodinfo;
  const pwoodninfo = simulation.woodninfo;
  
  clearBenchmark();
  
  startBenchmark("ChargeAvg");
  
  for (let i = 0; i < scharge.length; i++) {
    const d = scharge[i]-chargeAvg;
    
    if (d < chargeStep && d > -chargeStep) {
      scharge[i] = chargeAvg;
      
      continue;
    }
    
    if (d > 0) scharge[i] -= chargeStep;
    else if (!chargeNoUp) scharge[i] += chargeStep;
  }
  
  closeBenchmark();
  
  methods.eachCellOfType("Leaf", [5], i => {
    let nears = 0;
    
    if (leafMaxNears) {
      const sx = methods.indexX(i);
      const sy = methods.indexY(i);
      
      function f(x, y) {
        const i = methods.posIndex(sx+x, sy+y);
        
        if (ptype[i] === 5) nears++;
      }
      
      f(0, -1);
      f(1, 0);
      f(0, 1);
      f(-1, 0);
    }
    
    if (!leafMaxNears || nears < leafMaxNears) penergy[i] += methods.getSun(i);
    
    if (penergy[i] < leafConsumption) {
      penergy[i] = 0;
      
      methods.dead(i);
    } else penergy[i] -= leafConsumption;
    
    methods.deadByPotionTest(i);
  });
  
  methods.eachCellOfType("Root", [6], i => {
    const canget = Math.min(sorganic[i], rootSpeed);
    
    penergy[i] += canget*organicCost;
    
    sorganic[i] -= canget;
    
    if (penergy[i] < rootConsumption) {
      penergy[i] = 0;
      
      methods.dead(i);
    } else penergy[i] -= rootConsumption;
    
    methods.deadByPotionTest(i);
  });
  
  methods.eachCellOfType("Aerial", [7], i => {
    const canget = Math.min(scharge[i], aerialSpeed);
    
    penergy[i] += canget;
    
    scharge[i] -= canget;
    
    if (penergy[i] < aerialConsumption) {
      penergy[i] = 0;
      
      methods.dead(i);
    } else penergy[i] -= aerialConsumption;
    
    methods.deadByPotionTest(i);
  });
  
  methods.eachCellOfType("SproutInit", [2], i => {
    pnenergy[i] = 0;
    
    penergy[i] -= sproutConsumption;
  });
  
  methods.eachCellOfType("SproutMain", [2], i => {
    const parenti = methods.nearIndexByAngle(i, pparentwood[i]);
    
    const isManycell = ptype[parenti] > 0 && pparentwooduniq[i] === puniq[parenti];
    
    const getCommand = j => pgenome[
      i*genomeLength+genomeWidth*pcurprog[i]+
      (pcurrent[i]+j)%genomeWidth
    ];
    
    let left = commandsPerStep;
    let growed = false;
    
    while (left-- > 0) {
      const raw = getCommand(0);
      const command = raw & 31;
      
      let change = raw;
      let finish = false;
      
      if (command === 0) { // Ожидание
        change = 1;
        finish = true;
      }
      if (command === 1 || command === 31 || command === 30 || command === 29 || ((command === 28 || command === 27) && sproutCommandsV2)) { // Рост
        const i4 = i << 2;
        
        function getCost(j) {
          const type = getCommand(j+2) & 15;
          
          if (type === 1) return leafCost;
          if (type === 2) return rootCost;
          if (type === 3) return aerialCost+producerAvg;
          if (type === 4) return seedCost+producerAvg;
          if (type === 5) return seedShootBaseCost+seedShootDistanceCost*(getCommand(j+8)%seedShootDistance+1)+producerAvg;
          if (type >= 6 && type < 14) return sproutCost+producerAvg;
          
          return 0;
        }
        
        const cost = getCost(0)+getCost(1)+getCost(2);
        
        if (penergy[i] < cost) {
          change = getCommand(1);
          
          break;
        }
        
        penergy[i] -= cost;
        
        pwoodinfo[i] = 0;
        
        pwoodshape[i4] = 0;
        pwoodshape[i4+1] = 0;
        pwoodshape[i4+2] = 0;
        pwoodshape[i4+3] = 0;
        
        function grow(j) {
          const angle = correctAngle(pangle[i]+j-1);
          
          const k = methods.nearIndexByAngle(i, angle);
          
          if (ptype[k] === 0) {
            const type = getCommand(j+2) & 15;
            
            let shape, uniq;
            
            if (type === 1) {
              uniq = methods.putNewCellIndex(5, k);
              
              penergy[k] = leafInitial;
              
              shape = 0b01;
            }
            if (type === 2) {
              uniq = methods.putNewCellIndex(6, k);
              
              penergy[k] = rootInitial;
              
              shape = 0b01;
            }
            if (type === 3) {
              uniq = methods.putNewCellIndex(7, k);
              
              penergy[k] = aerialInitial;
              
              shape = 0b01;
            }
            if (type === 4) {
              uniq = methods.putNewCellIndex(3, k);
              
              methods.copyGenome(k, i);
              
              penergy[k] = producerAvg;
              pcurprog[k] = getCommand(j+5)%genomeHeight;
              
              shape = 0b10;
            }
            if (type === 5) {
              uniq = methods.putNewCellIndex(4, k);
              
              methods.copyGenome(k, i);
              
              penergy[k] = producerAvg;
              pcurprog[k] = getCommand(j+5)%genomeHeight;
              pseedshoot[k] = getCommand(j+8)%seedShootDistance+1;
              
              shape = 0b10;
            }
            if (type >= 6 && type < 14) {
              uniq = methods.putNewCellIndex(2, k);
              
              methods.copyGenome(k, i);
              
              penergy[k] = producerAvg;
              pcurprog[k] = getCommand(j+5)%genomeHeight;
              pcurrent[k] = 0;
              
              shape = 0b10;
            }
            
            pclan[k] = pclan[i];
            pparentwood[k] = inverseAngle(angle);
            pparentwooduniq[k] = puniq[i];
            
            const l = i4+angle;
            
            pwoodshape[l] = shape;
            pwooduniqs[l] = uniq;
            
            pangle[k] = angle;
          }
        }
        
        grow(0);
        grow(1);
        grow(2);
        
        methods.deleteCell(i);
        methods.putNewCellIndex(1, i, false);
        
        growed = true;
        finish = true;
      }
      if (command === 2) { // Поворот
        if (isManycell) change = getCommand(3);
        else {
          if (sproutCommandsV2) {
            const v = getCommand(1)%3;
            
            const angle = correctAngle(pangle[i]+(v === 2 ?
              (methods.chance(0.5) ? 1:-1):v
            ));
            
            pangle[i] = angle;
          } else {
            const angle = correctAngle(pangle[i]+((getCommand(1) & 1) ? 1:-1));
            
            pangle[i] = angle;
          }
          
          change = getCommand(2);
        }
      }
      if (command === 3) { // Шаг
        if (isManycell) change = getCommand(3);
        else {
          const angle = correctAngle(pangle[i]+getCommand(1));
          const k = methods.nearIndexByAngle(i, angle);
          
          if (ptype[k] > 0) change = getCommand(3);
          else {
            methods.moveCell(i, k);
            
            penergy[k] = penergy[i];
            pcurprog[k] = pcurprog[i];
            pcurrent[k] = (pcurrent[i]+getCommand(2))%genomeWidth;
            pparentwooduniq[k] = 0;
            
            methods.copyGenome(k, i, 0);
            
            return;
          }
        }
      }
      if (command === 4) { // Атака
        const angle = correctAngle(pangle[i]+getCommand(1));
        const k = methods.nearIndexByAngle(i, angle);
        
        if (!simulation.isNew[k] && !simulation.isDead[i] && ptype[k] > 1) {
          penergy[i] += organicCost*9;
          
          methods.dead(k, 0);
          
          change = getCommand(2);
          
          finish = true;
        } else change = getCommand(3);
      }
      if (command === 5) { // Выстрел
        const energy = getCommand(2)*energyUnit;
        const prog = getCommand(3)%genomeHeight;
        const distance = (getCommand(4)%seedShootDistance)+1;
        
        const cost = seedShootBaseCost+distance*seedShootDistanceCost+energy;
        
        if (penergy[i] < cost) change = getCommand(6);
        else {
          const angle = correctAngle(pangle[i]+getCommand(1));
          const k = methods.nearIndexByAngle(i, angle);
          
          if (ptype[k] > 0) change = getCommand(6);
          else {
            methods.putNewCellIndex(4, k);
            
            methods.copyGenome(k, i);
            
            penergy[k] = energy;
            pcurprog[k] = prog;
            pcurrent[k] = 0;
            pseedshoot[k] = distance;
            
            pclan[k] = pclan[i];
            pparentwood[k] = 0;
            pparentwooduniq[k] = 0;
            pangle[k] = angle;
            
            penergy[i] -= cost;
            
            change = getCommand(5);
            
            finish = true;
          }
        }
      }
      if (command === 6) { // Отвалиться
        if (isManycell) change = getCommand(2);
        else {
          methods.deleteCell(i);
          methods.putNewCellIndex(2, i);
          
          pcurprog[i] = getCommand(1)%genomeHeight;
          pcurrent[i] = 0;
          
          return;
        }
      }
      if (command === 7) { // Съесть органику
        if (sorganic[i] > 0 && !isManycell) {
          sorganic[i]--;
          
          penergy[i] += sproutOrganicEat;
          
          change = getCommand(1);
          
          finish = true;
        } else change = getCommand(2);
      }
      if (command === 8) { // Прикрепиться
        if (isManycell) change = getCommand(3);
        else {
          const angle = correctAngle(pangle[i]+getCommand(1));
          const k = methods.nearIndexByAngle(i, angle);
          
          if (!simulation.isNew[k] && ptype[k] === 1) {
            const iang = inverseAngle(angle);
            
            const l = (k << 2)+iang;
            
            pangle[i] = iang;
            
            pparentwood[i] = angle;
            pparentwooduniq[i] = puniq[k];
            
            pwoodshape[l] = 0b10;
            pwooduniqs[l] = puniq[i];
            
            change = getCommand(2);
            finsih = true;
          } else change = getCommand(3);
        }
      }
      if (command === 9) { // GOTO
        pcurrent[i] = getCommand(1)%genomeWidth;
        
        change = 0;
      }
      if (command === 10) { // Сменить программу
        pcurprog[i] = getCommand(1)%genomeHeight;
        pcurrent[i] = 0;
        
        change = 0;
      }
      if (command === 11) { // Многоклеточный ли я?
        if (isManycell) change = getCommand(1);
        else change = getCommand(2);
      }
      if (command === 12) { // Проверка энергии
        if (penergy[i] >= getCommand(1)*energyUnit) change = getCommand(2);
        else change = getCommand(3);
      }
      if (command === 13) { // Проверка органики
        if (penergy[i] >= Math.floor(getCommand(1)/255*maxOrganic)) change = getCommand(2);
        else change = getCommand(3);
      }
      if (command === 14) { // Проверка заряда
        if (penergy[i] >= Math.floor(getCommand(1)/255*maxCharge)) change = getCommand(2);
        else change = getCommand(3);
      }
      if (command === 15) { // Посмотреть
        const angle = correctAngle(pangle[i]+getCommand(1));
        const k = methods.nearIndexByAngle(i, angle);
        
        if (ptype[k] > 0) {
          if (ptype[k] === 1) change = getCommand(3);
          if (ptype[k] === 5 || ptype[k] === 6 || ptype[k] === 7) change = getCommand(4);
          if (ptype[k] === 2 || ptype[k] === 3) change = getCommand(5);
          if (ptype[k] === 4) change = getCommand(6);
        } else {
          if (sorganic[k] >= maxOrganic || scharge[k] >= maxCharge) change = getCommand(7);
          else change = getCommand(2);
        }
      }
      if (command === 16) { // Компос
        change = getCommand(pangle[i]);
      }
      
      if (sproutCommandsV2) { // Команды 2.0
        if (command === 17) { // Передача информации
          if (isManycell) {
            pwoodinfo[parenti] = getCommand(1)%woodInfoTransfer;
            
            change = getCommand(2);
          } else change = getCommand(3);
        }
        
        if (command === 18) { // Получение информации
          if (isManycell) {
            if (pwoodinfo[parenti] === getCommand(1)) change = getCommand(2);
            else change = getCommand(3);
          } else change = getCommand(4);
        }
        
        if (command === 19) { // Передвижение органики
          const anglep = getCommand(1)%5;
          
          const targang = correctAngle(pangle[i]+anglep);
          const tari = anglep === 4 ? i:methods.nearIndexByAngle(i, targang);
          
          function move(angle) {
            const ang = correctAngle(pangle[i]+angle);
            
            const k = angle === 4 ? i:methods.nearIndexByAngle(i, ang);
            
            if (k !== tari) {
              if (sorganic[k] >= organicMoving) {
                sorganic[tari] += organicMoving;
                sorganic[k] -= organicMoving;
              } else {
                sorganic[tari] += sorganic[k];
                sorganic[k] = 0;
              }
            }
          }
          
          move(0);
          move(1);
          move(2);
          move(3);
          move(4);
          
          change = getCommand(2);
          
          finish = true;
        }
      }
      
      pcurrent[i] = (pcurrent[i]+change)%genomeWidth;
      
      if (finish) break;
    }
    
    if (isManycell && !growed && penergy[i] > sproutFallEnergy) {
      puniq[i] = simulation.lastUniq++;
      
      pcurprog[i] = 0;
      pcurrent[i] = 0;
      
      pparentwooduniq[i] = 0;
    }
  });
  
  methods.eachCellOfType("Seed", [3], i => {
    pnenergy[i] = 0;
    
    penergy[i] -= seedConsumption;
    
    if (penergy[i] > seedFallEnergy) {
      puniq[i] = simulation.lastUniq++;
      
      pparentwooduniq[i] = 0;
    }
    
    const k = methods.nearIndexByAngle(i, pparentwood[i]);
    
    if (ptype[k] === 0 || puniq[k] !== pparentwooduniq[i]) {
      methods.deleteCell(i);
      methods.putNewCellIndex(2, i);
      
      pcurrent[i] = 0;
    }
  });
  
  methods.eachCellOfType("SeedShoot", [4], i => {
    pnenergy[i] = 0;
    
    penergy[i] -= seedConsumption;
    
    if (penergy[i] > seedFallEnergy) {
      puniq[i] = simulation.lastUniq++;
      
      pparentwooduniq[i] = 0;
    }
    
    const k = methods.nearIndexByAngle(i, pparentwood[i]);
    
    if (ptype[k] === 0 || puniq[k] !== pparentwooduniq[i]) {
      if (pseedshoot[i] > 0) {
        const k = methods.nearIndexByAngle(i, pangle[i]);
        
        if (ptype[k] > 0) {
          methods.dead(i);
          methods.dead(k);
        } else {
          methods.moveCell(i, k);
          
          penergy[k] = penergy[i];
          pcurprog[k] = pcurprog[i];
          pseedshoot[k] = pseedshoot[i]-1;
          pparentwooduniq[k] = 0;
          
          methods.copyGenome(k, i, 0);
        }
      } else {
        methods.deleteCell(i);
        methods.putNewCellIndex(2, i);
        
        pcurrent[i] = 0;
      }
    }
  });
  
  startBenchmark("InitNew");
  
  while (simulation.news.length > 0) {
    const i = simulation.news.pop();
    
    simulation.isNew[i] = 0;
    
    methods.deadByPotionTest(i);
  }
  
  closeBenchmark();
  
  {
    const stack = [];
    
    methods.eachCellOfType("WoodInit", [1], i => {
      let targetcount = 0;
      
      const i4 = i << 2;
      
      for (let j = 0; j < 4; j++) {
        const l = i4+j;
        
        const shape = pwoodshape[l];
        
        if (shape) {
          const k = methods.nearIndexByAngle(i, j);
          
          if (ptype[k] === 0 || puniq[k] !== pwooduniqs[l] || simulation.isDead[k] === 1) pwoodshape[l] = 0;
          else {
            if (shape === 0b10) {
              if (ptype[k] === 1) pwoodshape[l] = 0b11;
              else targetcount++;
            }
            if (shape === 0b11) {
              if (pwoodshape[(k << 2)+inverseAngle(j)] > 0) pwoodshape[l] = 0;
              else targetcount++;
            }
            if (shape === 0b01) {
              const cangive = penergy[k]-producerAvg;
              
              if (cangive > 0) {
                penergy[k] = producerAvg;
                
                penergy[i] += cangive;
                
                pwoodgived[l] = cangive;
              }
            }
          }
        }
      }
      
      pwoodninfo[i] = pwoodinfo[i];
      
      pnenergy[i] = 0;
      
      if (!targetcount) stack.push(i);
    });
    
    startBenchmark("WoodStack");
    
    while (stack.length > 0) {
      const i = stack.pop();
      
      let targetcount = 0;
      
      const i4 = i << 2;
      
      for (let j = 0; j < 4; j++) {
        const l = i4+j;
        
        if (pwoodshape[l] === 0b10) targetcount++;
        if (pwoodshape[l] === 0b11) {
          const k = methods.nearIndexByAngle(i, j);
          
          if (pwoodshape[(k << 2)+inverseAngle(j)] > 0) pwoodshape[l] = 0;
          else targetcount++;
        }
      }
      
      if (!targetcount) {
        const angle = pparentwood[i];
        const k = methods.nearIndexByAngle(i, angle);
        
        if (ptype[k] > 0 && puniq[k] === pparentwooduniq[i]) {
          pwoodshape[i4+angle] = 0b11;
          
          stack.push(k);
        } else methods.dead(i);
      }
    }
    
    closeBenchmark();
    
    methods.eachCellOfType("WoodGiving", [1], i => {
      const cangive = penergy[i]-producerAvg;
      
      const i4 = i << 2;
      
      if (cangive <= 0) {
        for (let j = 0; j < 4; j++) {
          const l = i4+j;
          
          const shape = pwoodshape[l];
          
          if (shape === 0b10 || shape === 0b11) pwoodgived[l] = 0;
        }
            
        return;
      }
      
      let count = 0;
      
      for (let j = 0; j < 4; j++) {
        const shape = pwoodshape[i4+j];
        
        if (shape === 0b10 || shape === 0b11) count++;
      }
      
      const giving = Math.floor(cangive/count);
      
      for (let j = 0; j < 4; j++) {
        const l = i4+j;
        
        const shape = pwoodshape[l];
        
        if (shape === 0b10 || shape === 0b11) {
          const k = methods.nearIndexByAngle(i, j);
          
          pnenergy[k] += giving;
          penergy[i] -= giving;
          
          pwoodgived[l] = giving;
          
          if (shape === 0b11 && pwoodinfo[i] > 0) {
            pwoodninfo[k] = pwoodinfo[i];
            
            pwoodgived[i] = 0;
          }
        }
      }
    });
    
    methods.eachCellOfType("WoodTaking", [1], i => {
      penergy[i] += pnenergy[i];
      
      pwoodinfo[i] = pwoodninfo[i];
      
      if (penergy[i] < woodConsumption) {
        penergy[i] = 0;
        
        methods.dead(i);
        
        return;
      } else penergy[i] -= woodConsumption;
      
      methods.deadByPotionTest(i);
    });
    
    methods.eachCellOfType("Taking", [2, 3, 4], i => {
      penergy[i] += pnenergy[i];
      
      if (penergy[i] < 0) {
        penergy[i] = 0;
        
        methods.dead(i);
        
        return;
      }
      
      methods.deadByPotionTest(i);
    });
  }
  
  methods.eachCellOfType("ProducerNoParent", [5, 6, 7], i => {
    if (!methods.isCellByLinkAlive(i, pparentwood[i], pparentwooduniq[i])) methods.dead(i);
  });
  
  startBenchmark("Death");
  
  while (simulation.deaths.length > 0) {
    const organic = simulation.deaths.pop();
    const i = simulation.deaths.pop();
    
    methods.deleteCell(i);
    
    methods.addResource(simulation.organic, i, addOrganic*organic);
    if (penergy[i] > 0) methods.addResource(simulation.charge, i, Math.floor(penergy[i]/9));
    
    ptype[i] = 0;
  }
  
  closeBenchmark();
  
  simulation.frame++;
}

function getSimulationConsts(consts) {
  return {
    mutationChance: consts.mutationChance ?? 0.2,
    deathOnPotionDestroysIt: consts.deathOnPotionDestroysIt ?? false,
    
    genomeWidth: consts.genomeWidth ?? 50,
    genomeHeight: consts.genomeHeight ?? 1,
    
    maxOrganic: consts.maxOrganic ?? 250,
    addOrganic: consts.addOrganic ?? 1,
    organicCost: consts.organicCost ?? 200,
    organicMoving: consts.organicMoving ?? 5,
    
    maxCharge: consts.maxCharge ?? 50000,
    chargeAvg: consts.chargeAvg ?? 10000,
    chargeStep: consts.chargeStep ?? 5,
    chargeNoUp: consts.chargeNoUp ?? true,
    
    woodConsumption: consts.woodConsumption ?? 10,
    woodInfoTransfer: consts.woodInfoTransfer ?? 0,
    
    leafCost: consts.leafCost ?? 3500,
    leafConsumption: consts.leafConsumption ?? 10,
    leafInitial: consts.leafInitial ?? consts.producerAvg ?? 100,
    leafMaxNears: consts.leafMaxNears ?? 1,
    
    rootCost: consts.rootCost ?? 3000,
    rootConsumption: consts.rootConsumption ?? 10,
    rootInitial: consts.rootInitial ?? consts.producerAvg ?? 100,
    rootSpeed: consts.rootSpeed ?? 3,
    
    aerialCost: consts.aerialCost ?? 3000,
    aerialConsumption: consts.aerialConsumption ?? 10,
    aerialInitial: consts.aerialInitial ?? consts.producerAvg ?? 100,
    aerialSpeed: consts.aerialSpeed ?? 600,
    
    producerAvg: consts.producerAvg ?? 100,
    
    sproutCost: consts.sproutCost ?? 2000,
    sproutConsumption: consts.sproutConsumption ?? 50,
    sproutFallEnergy: consts.sproutFallEnergy ?? 50000,
    sproutOrganicEat: consts.sproutOrganicEat ?? 100,
    
    sproutCommandsV2: consts.sproutCommandsV2 ?? false,
    
    seedCost: consts.seedCost ?? 3000,
    seedConsumption: consts.seedConsumption ?? 5,
    seedFallEnergy: consts.seedFallEnergy ?? 20000,
    
    seedShootDistance: consts.seedShootDistance ?? 20,
    seedShootBaseCost: consts.seedShootBaseCost ?? 3500,
    seedShootDistanceCost: consts.seedShootDistanceCost ?? 100,
    
    energyUnit: consts.energyUnit ?? 100
  };
}

function createSimulation(width, height, consts, seed) {
  const cells = width*height;
  
  const simulation = {
    width, height,
    
    organic: new Uint32Array(cells),
    charge: new Uint32Array(cells),
    
    type: new Uint8Array(cells),
    angle: new Uint8Array(cells),
    energy: new Int32Array(cells),
    nenergy: new Uint32Array(cells),
    clan: new Uint32Array(cells),
    
    uniq: new Float64Array(cells),
    
    isNew: new Uint8Array(cells),
    isDead: new Uint8Array(cells),
    
    woodshape: new Uint8Array(cells*4),
    wooduniqs: new Uint32Array(cells*4),
    woodgived: new Uint32Array(cells*4),
    woodinfo: new Uint8Array(cells),
    woodninfo: new Uint8Array(cells),
    
    parentwood: new Uint8Array(cells),
    parentwooduniq: new Uint32Array(cells),
    
    current: new Uint8Array(cells),
    curprog: new Uint8Array(cells),
    seedshoot: new Uint8Array(cells),
    mutations: new Uint32Array(cells),
    
    placeid: new Uint32Array(cells),
    
    consts: getSimulationConsts(consts),
    
    random: seed,
    seed,
    
    arr: [
      [], [], [], [], [], [], [], []
    ],
    
    emptyPlaces: [
      [], [], [], [], [], [], [], []
    ],
    
    news: [],
    deaths: [],
    
    frame: 0,
    population: 0,
    lastUniq: 1
  };
  
  simulation.genome = new Uint8Array(cells*(
    simulation.consts.genomeWidth*
    simulation.consts.genomeHeight
  ));
  
  simulation.methods = getSimulationMethods(simulation);
  
  return simulation;
}