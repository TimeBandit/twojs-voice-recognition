import Matter from "matter-js";
import p5 from "p5";
import { useEffect, useRef } from "react";
const { Engine, World, Bodies } = Matter;

// interface MainProps {
//   engine: Matter.Engine;
//   gameData: string[];
// }
const engine = Engine.create();

class Word {
  p: p5;
  text: string;
  body: Matter.Body;
  rect: { x: number; y: number; width: number; height: number };

  private padding: number = 20;
  private options = {
    friction: 0.3,
    restitution: 0.6,
  };

  constructor(text: string, p: p5) {
    this.text = text;
    this.p = p;

    // Set up text properties first
    this.p.textSize(16);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);

    // Get text dimensions
    const textWidth = this.p.textWidth(this.text);
    const textHeight = this.p.textAscent() + this.p.textDescent();

    const width = textWidth + this.padding * 2;
    const height = textHeight + this.padding * 2;

    // Calculate random position
    const x = p.random(width, p.width - width);
    const y = p.random(height, p.height - height);

    this.body = Bodies.rectangle(x, y, width, height, this.options);

    // Create rect dimensions based on text size plus padding
    this.rect = {
      width,
      height,
      x: -width / 2, // Centered around origin
      y: -height / 2, // Centered around origin
    };
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;

    /** */
    // Draw the rectangle
    this.p.push();
    this.p.translate(pos.x, pos.y);
    this.p.rotate(angle);

    // Draw rectangle centered on body position
    this.p.fill("yellow");
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, 0, this.rect.width, this.rect.height);

    // Draw text centered on body position
    this.p.fill("red");
    this.p.text(this.text, 0, 0);

    this.p.pop();
  }
}

function sketch(p: p5) {
  // p is a reference to the p5 instance this sketch is attached to
  let walls: Matter.Body[] = [];
  const wallThickness = 10;
  let words: Word[] = [];

  p.setup = function () {
    p.createCanvas(400, 400);

    // Create walls using Matter.js Bodies
    walls = [
      Bodies.rectangle(200, 400, 400, wallThickness, {
        isStatic: true,
        label: "bottomWall",
      }),
      Bodies.rectangle(200, 0, 400, wallThickness, {
        isStatic: true,
        label: "topWall",
      }),
      Bodies.rectangle(0, 200, wallThickness, 400, {
        isStatic: true,
        label: "leftWall",
      }),
      Bodies.rectangle(400, 200, wallThickness, 400, {
        isStatic: true,
        label: "rightWall",
      }),
    ];

    // Add walls to the world
    World.add(engine.world, walls);

    // const c = Bodies.rectangle(10, 10, 80, 80);
    const wordList = ["could", "World", "How", "Are", "You"];
    words = wordList.map((word) => new Word(word, p));
    World.add(
      engine.world,
      words.map((word) => word.body)
    );
  };

  p.draw = function () {
    p.background(0);

    // Draw the boundary walls
    p.noStroke();
    p.fill(100); // Gray color for walls

    walls.forEach((wall) => {
      const pos = wall.position;
      const width = wall.bounds.max.x - wall.bounds.min.x;
      const height = wall.bounds.max.y - wall.bounds.min.y;

      p.rectMode(p.CENTER); // Matter.js positions objects by center
      p.rect(pos.x, pos.y, width, height);
    });

    // your draw code here
    //when mouse button is pressed, circles turn black
    Engine.update(engine);
    words.forEach((word) => word.show());
  };
}

const Main = () => {
  // const { engine, gameData } = props;
  // console.log(engine, gameData);

  const p5ContainerRef = useRef(null);

  useEffect(() => {
    if (!p5ContainerRef.current) return;
    // On component creation, instantiate a p5 object with the sketch and container reference
    const p5Instance = new p5(sketch, p5ContainerRef.current);

    // On component destruction, delete the p5 instance
    return () => {
      p5Instance.remove();
    };
  }, []);

  return <main ref={p5ContainerRef}></main>;
};

export { Main };
