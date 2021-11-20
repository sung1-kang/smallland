import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

class ImageResource {
  constructor(filename) {
    this.image = new Image();
    this.image.src = filename;
  }
}

class Sprite {
  constructor(resource, size, positions) {
    this.resource = resource;
    this.size = size;
    this.positions = positions;

    this.worldPos = [0, 0];

    this.interval = 66;
    this.frame = 0
    this.timer = 0;
  }

  maxFrame() {
    return this.positions.length;
  }

  calcNextFrame(deltaTime) {
    if (this.timer > this.interval) {
      this.timer = 0;
      this.frame++;
      if (this.frame >= this.maxFrame()) this.frame = 0;
    } else {
        this.timer += deltaTime;
    }
  }

  updateImpl() {}

  update(deltaTime) {
    this.calcNextFrame(deltaTime);
    this.updateImpl();
  }

  draw(ctx) {
    ctx.drawImage(
      this.resource.image,
      this.positions[this.frame][0],
      this.positions[this.frame][1],
      this.size[0],
      this.size[1],
      this.worldPos[0],
      this.worldPos[1],
      this.size[0],
      this.size[1])
  }
}

class Idle extends Sprite {
  updateImpl() {
  }
}

class Walk extends Sprite {
  updateImpl() {
    this.worldPos[1] += 0.3;
    // this.worldPos[0] += 0.3;
  }
}

class Scene {
  constructor() {
    // TODO:
    const imageResource1 = new ImageResource("./64171.png");
    // const imageResource2 = new ImageResource("./64172.png");

    const sprite1 = new Idle(
      imageResource1,
      [32, 32],
      [[0, 0]]
    );
    const sprite2 = new Walk(
      imageResource1,
      [32, 32],
      [[0, 32], [32, 32], [64, 32], [96, 32], [128, 32], [160, 32]]
    );
    sprite2.worldPos[0] = 24;
    sprite2.interval = 33;
    this.sprites = [sprite1, sprite2];

    this.lastTime = 0;
  }

  draw(ctx, now) {
    const deltaTime = this.lastTime < 0.001 ? 0 : now - this.lastTime;
    this.lastTime = now;

    this.sprites.forEach((obj) => obj.update(deltaTime));
    this.sprites.forEach((obj) => obj.draw(ctx));
  }
}

const scene = new Scene();


export default function App() {
  const canvasRef = useRef(null);
  const [canvasCtx, setCanvasCtx] = useState(null);

  const animatePlayerLoop = useCallback(
    (now) => {
      if (!canvasCtx) return;

      // TODO:
      // canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
      canvasCtx.clearRect(0, 0, 640, 480);
      scene.draw(canvasCtx, now);
      window.requestAnimationFrame(animatePlayerLoop);
    },
    [canvasCtx]
  );

  useEffect(() => {
    setCanvasCtx(canvasRef.current.getContext("2d"));
    window.requestAnimationFrame(animatePlayerLoop);
  }, [canvasRef, animatePlayerLoop]);

  return (
    <div className="App">
      <canvas ref={canvasRef} className="Player" width="640" height="480" />
    </div>
  );
}
