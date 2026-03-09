# safex-webgl

**safex-webgl** is a lightweight 2D WebGL game engine written in **TypeScript**, inspired by and partially refactored from the HTML5 implementation of **Cocos2d-x (Cocos2d-JS)**.

The project modernizes the original architecture by migrating legacy JavaScript code to **TypeScript**, simplifying the rendering pipeline, and restructuring the codebase for modern web tooling.

This engine is designed for:

* Lightweight web games
* Playable ads
* Experimental game engine development
* Learning WebGL rendering pipelines

---

## Origins

This project is derived from parts of the HTML5 engine of **Cocos2d-x**.

The original engine:

* **Cocos2d-x**
* **Cocos2d-JS**

is licensed under the **MIT License**, which permits modification and redistribution.

`safex-webgl` refactors and restructures parts of the original architecture while introducing modern improvements.

---

## Key Improvements

Compared to the original HTML5 implementation, this engine introduces:

### TypeScript Migration

All core engine modules are rewritten or refactored into **TypeScript** to provide:

* Static typing
* Better IDE support
* Safer refactoring
* Improved maintainability

---

### Modern Project Structure

Legacy Cocos2d-JS used a large monolithic structure.
`safex-webgl` reorganizes the engine into smaller modular systems.

---

### Simplified WebGL Renderer

The renderer has been redesigned with a simplified batching pipeline:

* WebGL sprite batching
* Reduced state changes
* Simplified shader pipeline
* Smaller runtime footprint

---

### Modern Build System

The engine uses:

* **Vite** for development and bundling
* ES modules
* Tree-shaking
* Modern browser targets

This enables significantly smaller bundles compared to the legacy build system.

---

## Features

* Scene graph system
* Node hierarchy
* Sprite rendering
* WebGL batch renderer
* Texture management
* Input handling (mouse / touch)
* Simple animation utilities

---

## Example

```ts
import { Scene, Sprite } from "safex-webgl"

const scene = new Scene()

const sprite = new Sprite("hero.png")
sprite.x = 200
sprite.y = 100

scene.addChild(sprite)
```

---

## Development

Install dependencies:

```
bun install
```

Start development server:

```
bun run dev
```

Build production bundle:

```
bun run build
```

---

## Goals

The main goals of this project are:

* Modernize the HTML5 architecture of Cocos2d-JS
* Experiment with lightweight WebGL engines
* Provide a minimal engine suitable for playable ads and small games

---

## License

This project is licensed under the **MIT License**.

Parts of the architecture and original code are derived from **Cocos2d-x / Cocos2d-JS**, which are also licensed under the MIT License.

Please refer to the LICENSE file for details.

---

## Acknowledgements

* Cocos2d-x contributors
* The Cocos2d-JS HTML5 engine

Their work made this project possible.
