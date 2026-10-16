# H & J at Bay Pointe Inn: 3D walkthrough

A first-person 3D walkthrough of H & J's wedding at **Bay Pointe Inn on Gun Lake** (Shelbyville, Michigan), **July 4, 2027**. You start on the inn's lake terrace and walk down to the ceremony lawn, the Lakefront Pavilion, the bar and fire pit, and the docks. Press `T` to jump from 5 pm to 10 pm, when the fireworks go up over the lake. It runs in any modern browser and in a Meta Quest headset (WebXR).

It's built with [Three.js](https://threejs.org/) r128 and WebXR as a static site with no build step, on the same approach as the Hotel Alice Lloyd walkthrough.

## What's in it

- **The grounds** are measured off satellite imagery, in a site frame squared to the shoreline. They include the inn's lake face (cream siding, stacked white balconies, two front gables, dormers), the restaurant and its umbrella patio, the koi pond, the seawall boulders, the paths, and the docks with pontoons and flags. Across the water is the far shore of Gun Lake.
- **The ceremony** is on the lakefront lawn: the white arbor at the water's edge, blue hydrangea, peach roses, white chiffon, an aisle runner with petals, and 162 white garden chairs facing the lake. There's also a welcome sign, a table of paper fans, and Reserved cards on the front row.
- **The reception** is in the Lakefront Pavilion, with 18 rounds (153 seats). The tables have white linens, gold chiavari chairs, dusty-blue napkins, gold chargers, gold-wrapped favours, and alternating tall and low centrepieces. The sweetheart table sits in front of the lake, facing a monogrammed dance floor, with the DJ booth across the floor. The cake is by the water, and the gifts and seating chart are at the east entrance. Bistro string lights and red-white-blue bunting finish the room.
- **The patio** has the bar under a white tent (signature drinks: The Sparkler and the Gun Lake Mule), a stone fire pit with Adirondacks, cocktail highboys, cornhole, and a sparkler send-off station.
- **Time of day:** at 5:00 pm the sun is behind the inn. At 10:00 pm there's a twilight sky with stars, the windows, pavilion and lanterns are lit, the fire pit burns, and the fireworks show runs from a barge ~200 m out. Each burst flashes the lake, and its boom arrives late.

## Controls

| Key | Action |
| --- | --- |
| `W A S D` / arrows | Walk |
| Mouse / click-drag | Look |
| `Shift` | Walk faster |
| `T` | 5 pm ⇄ 10 pm (fireworks) |
| `F` | Fireworks finale |
| `1`–`8` | Jump to a spot (terrace, ceremony, arbor, pavilion, dance floor, bar, fire pit, docks) |
| `Tab` | Drone view (drag to orbit, scroll to zoom) |
| `M` | Sound on/off |
| `H` | Hide help |

On a phone, your left thumb walks (a virtual stick) and your right thumb looks around.

## VR (Meta Quest 2 / 3)

Open the site in the **Meta Quest Browser** and press **Enter VR**.

| Controller | Action |
| --- | --- |
| Left thumbstick | Walk (head-relative) |
| Right thumbstick ←/→ | Snap turn 30° |
| Right trigger or **A** | 5 pm ⇄ 10 pm |
| **B** | Jump to the next spot |
| **X** | Wrist map on/off |
| **Y** | Sound on/off |

The Quest browser is detected automatically and gets a lighter scene: no sun shadows, fewer flowers and trees, and a coarser terrain (~170k triangles, ~60–80 draw calls). Add `?low` to the URL to preview that mode on a desktop.

## Project structure

- `index.html`: the start screen, HUD, and script list
- `js/three.min.js`: vendored Three.js r128
- `js/engine.js`: the engine, exposed as `window.BP`. It covers the renderer, sky, lake shader, time of day, static batching (one mesh per material), instance pools, night glows, walkable areas and collision, the minimap, the drone view, and WebXR.
- `js/venue/site.js`: terrain, seawall, paths, pond, trees, neighbours, and the far shore
- `js/venue/inn.js`: the inn, the restaurant, and the Adirondacks on the lawn
- `js/venue/pavilion.js`: the Lakefront Pavilion, the string-light helper, and bunting
- `js/venue/docks.js`: docks, boats, and waving flags
- `js/venue/ceremony.js`: the arbor, aisle, chairs, signage, and the shared flower helpers
- `js/venue/reception.js`: tables, sweetheart table, dance floor, DJ, cake, gifts, and the seating chart
- `js/venue/lounge.js`: the bar tent, fire pit, highboys, cornhole, and sparklers
- `js/venue/fireworks.js`: the 10 pm show

### Site frame

Units are meters. `+x` runs along the shore to the southeast, `-z` points straight out over the lake (compass bearing ~34°), and the seawall is at `z = -2.5`. Key positions:

- the pavilion spans `x -34..-0.5`, `z -1.6..8.5`
- the arbor is at `(27, 0.5)`
- the inn's lake face is at `z = 31`, on a terrace 1.2 m up

To move something, change its numbers in the venue file. Each file is commented.

### Debug hook

`?debug` exposes `window.BAY`:

- `BAY.go(x, z, yaw)`, `BAY.look(yaw, pitch)`, and `BAY.step(dt)` move and render
- `BAY.calls()` and `BAY.tris()` report render stats
- `BP.jump(n)` jumps to a spot and `BP.setNight(true)` switches to 10 pm

`?night` starts at 10 pm.

## Run locally

```sh
python3 -m http.server 8090
```

Then open http://localhost:8090. To test on the headset against a local copy, connect it over USB and run `adb reverse tcp:8090 tcp:8090`. Then open http://localhost:8090 in the Quest browser.

The reference photos in `reference/` are git-ignored. They're the venue's and photographers' photos, used only for modelling.
