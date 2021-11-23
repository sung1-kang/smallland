import { useCallback, useEffect, useRef, useState } from "react";
import { ImageResource, Actor, Stand, Walk, SpriteState } from "./Sprite"
import "./App.css";

class KeyboardInputManager {
  constructor() {
    this.events = [];

    window.addEventListener(
      "keydown",
      (e) => {
        const events = this.events.filter(i => (i.type === e.type) && (i.code === e.code));
        if (events.length === 0) this.events.push(e);
      }
    );
    window.addEventListener(
      "keyup",
      (e) => {
        this.events = this.events.filter(i => i.code !== e.code);
      }
    );
  }

  getEventCodes() {
    return this.events.map(i => i.code);
  }

  flush() {
    this.events = [];
  }
}

class Scene {
  constructor(keyboardInputManager) {
    this.keyboardInputManager = keyboardInputManager;

    // TODO:
    const imageResource = new ImageResource("./finn.png");

    const actor = new Actor();
    actor.add(new Stand(imageResource, [32, 32], [32 * 6, 32], 1));
    actor.add(new Walk(imageResource, [32, 32], [0, 32], 6));
    actor.state = SpriteState.WALK;

    this.sprites = [actor];

    this.lastTime = 0;
  }

  draw(ctx, now) {
    const deltaTime = this.lastTime < 0.001 ? 0 : now - this.lastTime;
    this.lastTime = now;

    const eventCodes = this.keyboardInputManager.getEventCodes();

    this.sprites.forEach((obj) => obj.update(deltaTime, eventCodes));
    this.sprites.forEach((obj) => obj.draw(ctx));
  }
}

export default function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [canvasCtx, setCanvasCtx] = useState(null);

  const animatePlayerLoop = useCallback(
    (now) => {
      if (!canvasCtx || !sceneRef.current) return;

      // TODO:
      // canvasCtx.clearRect(0, 0, canvasCtx.width, canvasCtx.height);
      canvasCtx.clearRect(0, 0, 640, 480);
      sceneRef.current.draw(canvasCtx, now);
      window.requestAnimationFrame(animatePlayerLoop);
    },
    [canvasCtx]
  );

  useEffect(() => {
    setCanvasCtx(canvasRef.current.getContext("2d"));
    window.requestAnimationFrame(animatePlayerLoop);
    
    if (!sceneRef.current) {
      sceneRef.current = new Scene(new KeyboardInputManager());
    }
  }, [canvasRef, animatePlayerLoop]);

  return (
    <div className="App">
      <canvas ref={canvasRef} className="Player" width="640" height="480" />
    </div>
  );
}
