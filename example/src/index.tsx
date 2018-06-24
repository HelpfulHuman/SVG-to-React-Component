import * as React from "react";
import { render } from "react-dom";
import { Test } from "./Test";

render(
  <div>
    <Test
      artboardStrokeWidth={Math.ceil(Math.random() * 10)}
      artboardFill={randomColor()}
      artboardStroke={randomColor()}
      ovalFill={randomColor()}
      ovalStroke={randomColor()}
      rectangleFill={randomColor()}
      rectangleStroke={randomColor()}
      rectangle2Stroke={randomColor()}
      rectangle2Fill={randomColor()}
    />
  </div>,
  document.getElementById("app")
);

function randomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}