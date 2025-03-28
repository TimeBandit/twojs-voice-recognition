import Matter from "matter-js";
import p5 from "p5";
import { useEffect, useRef } from "react";
const { Engine, World, Bodies } = Matter;

// interface MainProps {
//   engine: Matter.Engine;
//   gameData: string[];
// }
const engine = Engine.create();
let p5circle: p5;
function sketch(p: p5) {
  // p is a reference to the p5 instance this sketch is attached to
  p.setup = function () {
    p.createCanvas(400, 400);
    p.background(0);
    p.fill(255, 255, 127);

    const c = Bodies.circle(10, 10, 20);
    p5circle = p.circle(10, 10, 20);
    World.add(engine.world, [c]);
  };

  p.draw = function () {
    p.clear();
    p.background(0);
    // your draw code here
    //when mouse button is pressed, circles turn black
    Engine.update(engine);
    engine.world.bodies.forEach((body) => {
      p.circle(body.position.x, body.position.y, 20);
    });
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
