<h1 align="center">🦠 Artifical Life (ALife) 🍀</h1>

**English 🇺🇸 | [Русский](README-RU.md) 🇷🇺**

Artifical evolution made with JavaScript.

Idea is taken from the project «Battle Of Clans» by [Simulife Hub](https://youtube.com/@wallcraft-video).

Version: 1.1.0 (01.03.2024)

[**DEMOVERSION**](https://megospc.github.io/ALife/demo.html?lang=en)\
[**FULL VERSION**](https://megospc.github.io/ALife/index.html?lang=en)

## Screenshots
<img width="300" src="images/snap1.png">
<img width="300" src="images/snap2.png">
<img width="300" src="images/snap3.png">
<img width="300" src="images/snap4.png">
<img width="300" src="images/snap5.png">

<details>
  <summary><b>Open me!</b></summary>
  <img width="900" src="images/snap6.png">
</details>

## Features
+ It works right in a browser: **you don't need to download anything**, just go by [the link](https://megospc.github.io/ALife/index.html?lang=en).
+ You can run worlds up to **1800x1800 tiles** in size.
+ It uses WebGL and it renders on your GPU, so **rendering is faster by 3 times**.
+ The required memory buffer allocates when the simulation starts, so JavaScript's garbage cleaner isn't busy. **This speeds up processing by 2 time**.
+ It works on mobile devices.

## Description
**ALife** is a simulator of evolution of multicellular organisms.

### Operating Principle
The entire field is divided into many squares (a «*Tile*»). Each *tile* contains a some amount of resources: *organic* and *charge*. There may also be a living cell (a «*Cell*») on a tile. Each *cell* has its own supply of energy and spends a little of it every turn. If there is not enough energy, the cell dies. When a cell dies, it leaves some *organic* and *charge* (amount of charge = energy that was in the cell) in a 3x3 *tiles* area. If there is  too much *organic* or *charge* in a tile, it becomes *poisoned*. If a cell locates on *poisoning*, it dies. If the *charge* exceeds a certain value, it begins to slowly disappear until it reaches that value.

Cells can be different types:
+ **Leaf**. Each turn gets energy from the sun. The more *organic* there is in a *tile* under a leaf, the more energy it can get. If two leaves touch, they both stop producing energy.
+ **Root**. Each turn removes a little *organic* (if any) from the tile under it and gets energy. Does not die from *organic poisoning*.
+ **Antenna**. Each turn removes a little *charge* (if any) from the tile under it and gets energy. Does not die from *energy poisoning*.
+ **Shoot**. Consumes a lot of energy. Each shoot has its own *genome* (the program according to which it operates). By following its instructions, shoot can grow, creating up to three new cells around itself (it itself will turn into a wood), eat any *cell* nearby (except wood), etc. As long as it has not given off branches, it can also move around the field and eat organic. Its color depends on the amount of energy, which it has (black - little, white - a lot). If the shoot accumulates a lot of energy, it will fall off the wood to which it is attached and become single-celled.
+ **Wood**. Transfers energy from producing cells to shoots and seeds.
+ **Seed**. A dormant shoot that consumes almost no energy. If the wood, to which it is attached, dies, the seed wakes up and turns into a shoot that will continue to carry out the commands of the *genome*. Sometimes, before turning into a shoot, a seed shoots out and flies through a certain number of *tiles*. If it touches another *cell* on its way, this cell and the seed die. It will also fall off and wake up if it accumulates a certain amount of energy.

<img width="300" src="images/description1en.png">

### Home Page
By opening the [home page](https://megospc.github.io/ALife/index.html?lang=ru), you will see the simulation settings:
+ **Seed**. The number from which the simulation will be created. Simulations with the same settings and seeds will give the same result.
+ **Field size**. The size of the simulation in *tiles*.
+ **Sun level**. The higher the sun level, the more energy leaves can get.
+ **Initial density**. Density of location of the first shoots. 1/9 means that on every ninth *tile* (on the average) will be a shoot. 1/6 - on every sixth, 1/50 - on every fiftieth, etc.
+ **Organic, charge**. The amount of organic and charge that will be in each tile when the simulation starts.

Once you have set up the simulation, click the «start» button.

<img width="300" src="images/description2en.png">

1. Levers for adjusting zoom/speed.
2. Buttons. "Pause/Continue" stops/resumes the simulation. “To Center” resets the zoom and camera position. “Snapshot” downloads a snapshot of the view window.
3. Statistics. “Iteration” is the number of the current simulation frame. “Population” is the current number of cells in the simulation. "FPS" - average number of frames per second.
4. Rendering modes. Change the color of cells/tiles. “Drawing mode” for cells and “Ground drawing mode” for tiles.
5. View window. Here you can see what is happening in the simulation. Hold and move the mouse to change the camera's position. You can also click on any tile to see information about it.
6. Disable rendering. If checked, the view window is hidden.
7. Productivity and simulation seed.

*If someting isn't clear enough, please, write about it in Issues.*