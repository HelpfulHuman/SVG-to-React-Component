#!/usr/bin/env node
import * as program from "commander";
import chalk from "chalk";
import { readFile, writeFile, lstatSync } from "fs";
import { resolve, basename } from "path";
import { convertSVGToComponent } from ".";
import { camelCase, capitalize } from "lodash";

let filename: string;

program
  .version("1.0.0")
  .usage("[options] <filename>")
  .arguments("<filename>")
  .option("-n, --componentName <n>", "the desired name for the component")
  .option("-o, --output <n>", "the desired filepath for output")
  .option("-t, --typescript", "output as a Typescript .tsx file")
  .action(f => {
    filename = f;
  });

program.parse(process.argv);

if (!filename) {
  console.log(chalk.red("You must provide a filename for the SVG you want to convert."));
  process.exit(1);
}

readFile(resolve(filename), (err, data) => {
  if (err) {
    console.log(chalk.red(`Unable to read file from ${filename}, check your filepath and try again.`));
    process.exit(1);
  }

  const opts = program.opts();
  const name = capitalize(camelCase(opts.componentName || basename(filename, ".svg")));
  const useTypescript = !!opts.typescript;

  let outputPath = name + "." + (useTypescript ? "tsx" : "jsx");

  if (opts.output) {
    if (lstatSync(opts.output).isDirectory()) {
      outputPath = resolve(opts.output + "/" + outputPath);
    } else {
      outputPath = resolve(opts.output);
    }
  } else {
    outputPath = resolve(outputPath);
  }

  let result = convertSVGToComponent({
    componentName: name,
    contents: data.toString(),
    typescript: useTypescript,
  });

  writeFile(outputPath, result, (err) => {
    if (err) {
      console.log(chalk.red(`Failed to save component to filepath "${outputPath}"`));
      process.exit(1);
    } else {
      console.log(chalk.green(`Successfully created component from SVG file:`));
      console.log(outputPath);
      process.exit(0);
    }
  });
});