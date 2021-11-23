class ImageResource {
  constructor(filename) {
    this.image = new Image();
    this.image.src = filename;
  }
}

const SpriteDirection = Object.freeze({
  SOUTH: 0,
  SOUTHWEST: 1,
  EAST: 2,
  NORTHWEST: 3,
  NORTH: 4,
  NORTHEAST: 5,
  WEST: 6,
  SOUTHEAST: 7,
});

const SpriteState = Object.freeze({
  NONE: 0,
  STAND: 1,
  WALK: 2,
});

class ISprite {
  getState() {}

  update(deltaTime, eventCodes) {}

  draw(ctx) {}
}

class Sprite extends ISprite {
  constructor(resource, size, position, numFrame) {
    super();
    const data = {
      resource,
      size,
      position,
      numFrame,
      interval: 66,
      direction: SpriteDirection.SOUTH,
      worldPos: [0, 0],
    };
    this.frame = 0;
    this.timer = 0;
    
    Object.defineProperties(
      this,
      Object.freeze({
        resource: {
          value: data.resource,
          writable: false,
        },
        size: {
          value: data.size.slice(),
          writable: false,
        },
        position: {
          value: data.position.slice(),
          writable: false,
        },
        numFrame: {
          value: data.numFrame,
          writable: false,
        },
        interval: {
          value: data.interval,
          writable: true,
        },
        direction: {
          get: () => data.direction,
          set: (direction) => {
            data.direction = direction;
          }
        },
        worldPos: {
          get: () => data.worldPos.slice(),
          set: (worldPos) => {
            data.worldPos = worldPos;
          }
        },
      })
    );  
  }

  // abstract function
  getState() {}

  // abstract function
  updateImpl() {}

  calcNextFrame(deltaTime) {
    if (this.timer > this.interval) {
      this.timer = 0;
      this.frame++;
      if (this.frame >= this.numFrame) this.frame = 0;
    } else {
        this.timer += deltaTime;
    }
  }

  update(deltaTime, eventCodes) {
    this.calcNextFrame(deltaTime);
    this.updateImpl();
    return this.worldPos;
  }

  draw(ctx) {
    ctx.drawImage(
      this.resource.image,
      this.position[0] + this.size[0] * this.frame,
      this.position[1] + this.size[1] * this.direction,
      this.size[0],
      this.size[1],
      this.worldPos[0].toFixed(),
      this.worldPos[1].toFixed(),
      this.size[0],
      this.size[1])
  }
}

class Actor extends ISprite {
  constructor() {
    super();
    const data = {
      state: SpriteState.NONE,
      direction: SpriteState.SOUTH,
    };
    this.sprites = new Map();

    Object.defineProperties(
      this,
      Object.freeze({
        state: {
          get: () => data.state,
          set: (state) => {
            data.state = state;
          }
        },
        direction: {
          get: () => data.direction,
          set: (direction) => {
            data.direction = direction;
          }
        },
      })
    );
  }

  add(sprite) {
    this.sprites.set(sprite.getState(), sprite);
  }

  get(state) {
    return this.sprites.get(state);
  }
  
  getCurrentSprite() {
    return this.get(this.state);
  }

  update(deltaTime, eventCodes) {
    let sprite = this.getCurrentSprite();
    const worldPos = sprite.worldPos;

    // TODO:
    if (eventCodes.length === 0) {
      this.state = SpriteState.STAND;
      this.direction = sprite.direction;
    } else {
      const flags = {
        arrowUp: eventCodes.includes("ArrowUp"),
        arrowDown: eventCodes.includes("ArrowDown"),
        arrowLeft: eventCodes.includes("ArrowLeft"),
        arrowRight: eventCodes.includes("ArrowRight"),
      };

      if (flags.arrowUp && flags.arrowLeft) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.NORTHEAST;
      } else if (flags.arrowUp && flags.arrowRight) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.NORTHWEST;
      } else if (flags.arrowDown && flags.arrowLeft) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.SOUTHEAST;
      } else if (flags.arrowDown && flags.arrowRight) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.SOUTHWEST;
      } else if (flags.arrowUp) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.NORTH;
      } else if (flags.arrowDown) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.SOUTH;
      } else if (flags.arrowLeft) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.WEST;
      } else if (flags.arrowRight) {
        this.state = SpriteState.WALK;
        this.direction = SpriteDirection.EAST;
      }
    }

    if (sprite.getState() !== this.state) {
      sprite = this.getCurrentSprite();
      sprite.worldPos = worldPos;
    }
    sprite.direction = this.direction;

    sprite.update(deltaTime, eventCodes);
  }

  draw(ctx) {
    const sprite = this.getCurrentSprite();
    sprite.draw(ctx);
  }
}

class Stand extends Sprite {
  getState() {
    return SpriteState.STAND;
  }

  updateImpl() {
  }
}

class Walk extends Sprite {
  getState() {
    return SpriteState.WALK;
  }

  updateImpl() {
    const worldPos = this.worldPos;
    const speed = 1;

    if (this.direction === SpriteDirection.SOUTH) {
      worldPos[1] += 2 * speed;
    } else if (this.direction === SpriteDirection.NORTH) {
      worldPos[1] -= 2 * speed;
    } else if (this.direction === SpriteDirection.EAST) {
      worldPos[0] += 2 * speed;
    } else if (this.direction === SpriteDirection.WEST) {
      worldPos[0] -= 2 * speed;
    } else if (this.direction === SpriteDirection.NORTHEAST) {
      worldPos[0] -= 1.414 * speed;
      worldPos[1] -= 1.414 * speed;
    } else if (this.direction === SpriteDirection.NORTHWEST) {
      worldPos[0] += 1.414 * speed;
      worldPos[1] -= 1.414 * speed;
    } else if (this.direction === SpriteDirection.SOUTHEAST) {
      worldPos[0] -= 1.414 * speed;
      worldPos[1] += 1.414 * speed;
    } else if (this.direction === SpriteDirection.SOUTHWEST) {
      worldPos[0] += 1.414 * speed;
      worldPos[1] += 1.414 * speed;
    }

    this.worldPos = worldPos;
  }
}

export { Actor, Stand, Walk, ImageResource, SpriteState };
