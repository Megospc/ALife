const fs = require("fs");

const dir = fs.readdirSync("species");

const items = [];

dir.forEach(name => {
  const match = name.match(/(.*?)\.(.*)/);
  const data = fs.readFileSync("species/"+name);
  
  const obj = JSON.parse(data);
  
  obj.settings ??= {
    sun: 500,
    resources: 10000,
    prog: 0
  };
  
  obj.settings.prog ??= 0;
  obj.settings.sun = +obj.settings.sun;
  obj.settings.resources = +obj.settings.resources;
  
  if (typeof obj.descriotion === "string") {
    obj.description = obj.descriotion;
    
    delete obj.descriotion;
  }
  
  const newdata = JSON.stringify(obj);
  
  items.push({
    name: obj.name,
    data: newdata
  });
  
  const newname = obj.name+".alife-species";
  
  fs.writeFileSync("species/"+newname, newdata);
  
  if (name != newname) fs.unlinkSync("species/"+name);
});

const html = `<!DOCTYPE html>
<html>
<head>
  <title>ALife3 Библиотека</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
  <style>
    .item {
      margin-bottom: 5px;
      margin-top: 5px;
      color: #0000a0;
    }
  </style>
</head>
<body>
  <h1>ALife2 Библиотека</h1>
  <div>
    <label for="filter">Поиск: </label>
    <input class="input" type="text" style="width: 300px" id="filter">
  </div>
  <div>
    <input type="checkbox" id="deep" onchange="lastfilter = ''" checked>
    <label for="deep">Глубокий поиск</label>
  </div>
  <div style="margin-bottom: 20px">
    <input type="checkbox" id="regexp" onchange="lastfilter = ''" checked>
    <label for="regexp">RegExp</label>
  </div>
  ${items.map((x, i) => `<p class="item" id="item${i}" onclick="item(${i})">${x.name}</p>`).join("\n  ")}
</body>
<script>
  const filterinput = document.getElementById("filter");
  const deepinput = document.getElementById("deep");
  const regexpinput = document.getElementById("regexp");
  
  var lastfilter = "";
  
  const items = [
    ${items.map(x => x.data).join(",\n    ")}
  ];
  
  const elems = [];
  
  for (let i = 0; i < items.length; i++) elems[i] = document.getElementById("item"+i);
  
  function filterItems() {
    lastfilter = filterinput.value;
    
    if (regexpinput.checked) {
      try {
        const regexp = new RegExp(filterinput.value);
        
        for (let i = 0; i < items.length; i++) elems[i].style.display = regexp.exec(items[i].name) || (deepinput.checked && regexp.exec(items[i].description)) ? "block":"none";
      } catch(e) {};
    } else for (let i = 0; i < items.length; i++) elems[i].style.display = items[i].name.includes(lastfilter) || (deepinput.checked && items[i].description.includes(lastfilter)) ? "block":"none";
  }
  
  function item(i) {
    sessionStorage.setItem("alife-save", JSON.stringify(items[i]));
    
    window.open("sandbox.html");
  }
  
  setInterval(function() {
    if (filterinput.value != lastfilter) filterItems();
  }, 50);
</script>
`;

fs.writeFileSync("species.html", html);