import { Application, extend, useApplication, useTick } from "@pixi/react";
import { Assets, Container, Sprite, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Sprite,
});

const BunnySprite = () => {
  const { app } = useApplication();

  // The Pixi.js `Sprite`
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  // Listen for animate update
  useTick((ticker) => {
    if (!spriteRef.current) return;
    spriteRef.current.rotation += 0.1 * ticker.deltaTime;

    // Clamp bunny position to viewport
    const bunny = spriteRef.current;
    const halfWidth = bunny.width / 2;
    const halfHeight = bunny.height / 2;
    const minX = halfWidth;
    const maxX = app.screen.width - halfWidth;
    const minY = halfHeight;
    const maxY = app.screen.height - halfHeight;

    bunny.x = Math.max(minX, Math.min(bunny.x, maxX));
    bunny.y = Math.max(minY, Math.min(bunny.y, maxY));
  });

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={app.screen.width / 2}
      y={app.screen.height / 2}
      scale={0.1} // Scale bunny to 10% of its original size
    />
  );
};

export default function App() {
  return (
    // We'll wrap our components with an <Application> component to provide
    // the Pixi.js Application context
    <Application background={"#1099bb"} resizeTo={window}>
      <BunnySprite />
    </Application>
  );
}
