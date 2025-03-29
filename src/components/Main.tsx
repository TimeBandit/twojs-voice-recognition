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

    // Create rect dimensions based on text size plus padding
    this.rect = {
      x: p.random(0, p.width - width),
      y: p.random(0, p.height - height),
      // x: 50,
      // y: 50,
      width,
      height,
    };

    this.body = Bodies.rectangle(0, 0, width, height, this.options);
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;

    /** */
    // Draw the rectangle
    this.p.push();
    this.p.translate(pos.x, pos.y);
    this.p.rotate(angle);

    this.p.fill("yellow");
    this.p.rectMode(this.p.CORNER);
    this.p.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);

    // Draw the text
    this.p.fill("red");
    this.p.text(
      this.text,
      this.rect.x + this.rect.width / 2,
      this.rect.y + this.rect.height / 2
    );

    this.p.pop();
  }
}

function sketch(p: p5) {
  // p is a reference to the p5 instance this sketch is attached to
  const wallThickness = 10;
  let words: Word[] = [];

  p.setup = function () {
    p.createCanvas(400, 400);

    // Create walls using Matter.js Bodies
    const walls = [
      // Bottom wall
      Bodies.rectangle(200, 400, 400, wallThickness, { isStatic: true }),
      // Top wall
      Bodies.rectangle(200, 0, 400, wallThickness, { isStatic: true }),
      // Left wall
      Bodies.rectangle(0, 200, wallThickness, 400, { isStatic: true }),
      // Right wall
      Bodies.rectangle(400, 200, wallThickness, 400, { isStatic: true }),
    ];

    // Add walls to the world
    World.add(engine.world, walls);

    // p.background(0);

    // const message = "Hello World";
    // const padding = 20; // Padding around the text

    // Set up text properties first
    // p.textSize(16);
    // p.textAlign(p.CENTER, p.CENTER);

    // Get text dimensions
    // const textWidth = p.textWidth(message);
    // const textHeight = p.textAscent() + p.textDescent();

    // Create rect dimensions based on text size plus padding
    // const rect = {
    //   x: 50,
    //   y: 50,
    //   width: textWidth + padding * 2,
    //   height: textHeight + padding * 2,
    // };

    // Draw the rectangle
    // p.fill("yellow");
    // p.rect(rect.x, rect.y, rect.width, rect.height);

    // Draw the text
    // p.fill("red");
    // p.text(message, rect.x + rect.width / 2, rect.y + rect.height / 2);

    // const c = Bodies.rectangle(10, 10, 80, 80);
    const wordList = ["could", "World", "How", "Are", "You"];
    words = wordList.map((word) => new Word(word, p));
    World.add(
      engine.world,
      words.map((word) => word.body)
    );
    engine.gravity.x = 1; // Disable gravity
    engine.gravity.y = 1;
  };

  p.draw = function () {
    p.background(0);

    // Draw the boundary walls
    p.noStroke();
    p.fill(100); // Gray color for walls
    p.rect(0, 0, p.width, wallThickness); // Top
    p.rect(0, p.height - wallThickness, p.width, wallThickness); // Bottom
    p.rect(0, 0, wallThickness, p.height); // Left
    p.rect(p.width - wallThickness, 0, wallThickness, p.height); // Right

    // your draw code here
    //when mouse button is pressed, circles turn black
    Engine.update(engine);
    words.forEach((word) => word.show());
    // engine.world.bodies.forEach((body) => {
    //   p.push();
    //   p.colorMode(p.RGB);
    //   const text = `${body.label}`;
    //   const textWidth = p.textWidth(text);
    //   const rectWidth = textWidth * 2
    //   const rect = p.rect(body.position.x, body.position.y, rectWidth, 20);
    //   this.push();
    //   this.fill("red");
    //   p.text(text, body.position.x+, body.position.y);
    //   this.pop();
    // });
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
