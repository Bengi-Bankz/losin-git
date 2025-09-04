import { Application, extend, useApplication, useTick } from "@pixi/react";
import { Assets, Container, Sprite, Texture, Graphics } from "pixi.js";
import { useEffect, useRef, useState } from "react";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Sprite,
  Graphics,
});

interface DuckProps {
  id: number;
  startX: number;
  startY: number;
  row: number;
}

const Duck = ({ id, startX, startY, row }: DuckProps) => {
  const { app } = useApplication();
  const spriteRef = useRef<Sprite>(null);
  const [texture, setTexture] = useState(Texture.EMPTY);

  // Preload the duck sprite
  useEffect(() => {
    if (texture === Texture.EMPTY) {
      Assets.load("/assets/bunny.png").then((result) => {
        setTexture(result);
      });
    }
  }, [texture]);

  // Duck movement animation
  useTick((ticker) => {
    if (!spriteRef.current) return;
    
    const duck = spriteRef.current;
    const speed = 2 + (row * 0.5); // Different speeds per row
    const time = ticker.lastTime * 0.001;
    
    // Horizontal movement with wrapping
    duck.x = startX + Math.sin(time * speed + id) * 50;
    if (duck.x > app.screen.width + 50) {
      duck.x = -50;
    }
    
    // Gentle floating motion
    duck.y = startY + Math.sin(time * 2 + id) * 10;
    
    // Gentle rotation
    duck.rotation = Math.sin(time + id) * 0.1;
  });

  // Calculate responsive scale based on screen size
  const getScale = () => {
    const baseScale = 0.08;
    const screenWidth = app.screen.width;
    const scaleFactor = Math.min(screenWidth / 800, 1);
    return baseScale * scaleFactor;
  };

  return (
    <pixiSprite
      ref={spriteRef}
      texture={texture}
      anchor={0.5}
      x={startX}
      y={startY}
      scale={getScale()}
    />
  );
};

const Background = () => {
  const { app } = useApplication();

  const drawBackground = (graphics: Graphics) => {
    graphics.clear();
    
    // Create a gradient-like background with multiple rectangles
    const colors = [0x87CEEB, 0x4169E1, 0x1E90FF]; // Sky blue gradient
    const height = app.screen.height / colors.length;
    
    colors.forEach((color, index) => {
      graphics.beginFill(color);
      graphics.drawRect(0, index * height, app.screen.width, height);
      graphics.endFill();
    });
  };

  return <pixiGraphics draw={drawBackground} />;
};

const ScoreDisplay = () => {
  const [score, setScore] = useState(0);

  // Simple score increment over time
  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => prev + 10);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      color: 'white',
      fontSize: 'clamp(18px, 4vw, 28px)',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      fontFamily: 'Arial, sans-serif',
      zIndex: 10,
    }}>
      Score: {score.toLocaleString()}
    </div>
  );
};

const DuckGame = () => {
  const { app } = useApplication();
  const [ducks, setDucks] = useState<DuckProps[]>([]);

  // Generate duck positions based on screen size
  useEffect(() => {
    const generateDucks = () => {
      const screenWidth = app.screen.width;
      const screenHeight = app.screen.height;
      
      // Calculate responsive grid
      const ducksPerRow = Math.max(3, Math.floor(screenWidth / 120));
      const rows = Math.max(2, Math.floor(screenHeight / 150));
      
      const newDucks: DuckProps[] = [];
      let id = 0;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < ducksPerRow; col++) {
          const x = (screenWidth / (ducksPerRow + 1)) * (col + 1);
          const y = (screenHeight / (rows + 1)) * (row + 1);
          
          newDucks.push({
            id: id++,
            startX: x,
            startY: y,
            row: row,
          });
        }
      }
      
      setDucks(newDucks);
    };

    generateDucks();
    
    // Regenerate on screen size change
    const handleResize = () => {
      setTimeout(generateDucks, 100); // Small delay to ensure screen size is updated
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [app.screen.width, app.screen.height]);

  return (
    <pixiContainer>
      <Background />
      {ducks.map((duck) => (
        <Duck
          key={duck.id}
          id={duck.id}
          startX={duck.startX}
          startY={duck.startY}
          row={duck.row}
        />
      ))}
    </pixiContainer>
  );
};

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <ScoreDisplay />
      <Application 
        background={"#87CEEB"} 
        resizeTo={window}
        antialias={true}
        resolution={window.devicePixelRatio || 1}
        autoDensity={true}
      >
        <DuckGame />
      </Application>
    </div>
  );
}
