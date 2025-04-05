import Matter from "matter-js";
import ml5 from "ml5";
import p5 from "p5";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
const { Engine, World, Bodies } = Matter;
// interface MainProps {
//   engine: Matter.Engine;
//   gameData: string[];
// }

function createCloseEncountersPlayer() {
  // Initialize Tone.js
  const synth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 1.5 },
  }).toDestination();

  // Add reverb for that spacey feel
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
  synth.connect(reverb);

  // Define the Close Encounters sequence
  const sequence = [
    { note: "D4", name: "Re", description: "First tone (D)" },
    { note: "E4", name: "Mi", description: "Second tone (E)" },
    { note: "C4", name: "Do (high)", description: "Third tone (high C)" },
    { note: "C3", name: "Do (low)", description: "Fourth tone (low C)" },
    { note: "G3", name: "So", description: "Fifth tone (G)" },
  ];

  // Keep track of current position in the sequence
  let currentIndex = 0;

  // Function to play the next tone in the sequence
  const playNextTone = () => {
    // Play the current tone
    const currentTone = sequence[currentIndex];
    synth.triggerAttackRelease(currentTone.note, 0.8);

    // Prepare return information
    const result = {
      ...currentTone,
      position: currentIndex + 1,
      isLastTone: currentIndex === sequence.length - 1,
    };

    // Increment the position for next call
    currentIndex = (currentIndex + 1) % sequence.length;

    return result;
  };

  // Function to play the entire sequence
  const playFullSequence = () => {
    const now = Tone.now();
    sequence.forEach((tone, index) => {
      synth.triggerAttackRelease(tone.note, 0.8, now + index * 1);
    });

    // Reset the index to start over after playing the full sequence
    currentIndex = 0;
  };

  // Function to reset the sequence to the beginning
  const resetSequence = () => {
    currentIndex = 0;
    return "Sequence reset to beginning";
  };

  // Return the interface for the player
  return {
    playNextTone,
    playFullSequence,
    resetSequence,
    getCurrentPosition: () => currentIndex,
  };
}

const engine = Engine.create();
const closeEncountersPlayer = createCloseEncountersPlayer();

class Word {
  p: p5;
  text: string;
  scale: number;
  body: Matter.Body;
  isRemoving: boolean;
  rect: { x: number; y: number; width: number; height: number };

  private padding: number = 20;
  private options = {
    friction: 0.3,
    restitution: 0.6,
  };

  constructor(text: string, p: p5) {
    this.text = text;
    this.p = p;
    this.scale = 1; // Start at full size
    this.isRemoving = false; // Track removal state

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

    this.body = Bodies.rectangle(x, y, width, height, {
      ...this.options,
      label: this.text.toLowerCase(),
    });

    // Create rect dimensions based on text size plus padding
    this.rect = {
      width,
      height,
      x: -width / 2, // Centered around origin
      y: -height / 2, // Centered around origin
    };
  }

  remove() {
    this.isRemoving = true; // Start shrink animation
  }

  show() {
    if (this.isRemoving) {
      this.scale *= 0.95; // Gradually shrink
      if (this.scale < 0.05) {
        World.remove(engine.world, this.body); // Remove from physics
        return; // Stop drawing
      }
    }

    const pos = this.body.position;
    const angle = this.body.angle;

    /** */
    // Draw the rectangle
    this.p.push();
    this.p.translate(pos.x, pos.y);
    this.p.rotate(angle);
    this.p.scale(this.scale); // Apply scaling

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

  // Variable for displaying the results on the canvas
  let predictedWord = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let classifier: any;

  // A function to run when we get any errors and the results
  function gotResult(results: { label: string; confidence: number }[]) {
    // The results are in an array ordered by confidence
    console.log(results);
    if (results[0].confidence > 0.9) {
      predictedWord = results[0].label;
      console.log(predictedWord);
      words.forEach((word) => {
        if (predictedWord === word.text.toLowerCase()) {
          word.remove(); // Start animation
          closeEncountersPlayer.playNextTone();
        }
      });
    }
  }

  p.preload = function () {
    const options = { probabilityThreshold: 0.7 };
    classifier = ml5.soundClassifier("SpeechCommands18w", options);
    console.log(ml5);
  };

  p.setup = function () {
    p.createCanvas(400, 400);
    // Classify the sound from microphone in real time
    classifier.classifyStart(gotResult);

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
    const wordList = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    words = wordList.map((word) => new Word(word, p));
    World.add(
      engine.world,
      words.map((word) => word.body)
    );

    p.mousePressed = function () {
      words.forEach((word) => {
        const pos = word.body.position;
        const d = p.dist(p.mouseX, p.mouseY, pos.x, pos.y);

        if (d < word.rect.width / 2) {
          word.remove(); // Start animation
        }
      });
    };
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
