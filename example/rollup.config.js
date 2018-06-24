import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import replace from "rollup-plugin-replace";

export default {
  input: "src/index.tsx",
  output: {
    file: "public/app.js",
    format: "iife"
  },
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        react: ["createElement", "Component"],
        "react-dom": ["render"]
      }
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    typescript()
  ]
};
