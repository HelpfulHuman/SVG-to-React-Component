import { camelCase, capitalize } from "lodash";
import { xml2js, Element, js2xml, Attributes } from "xml-js";
import * as nunjucks from "nunjucks";
import { TEMPLATE_TS } from "./templates/typescript";

export type ConvertSVGOpts = {
  contents: string;
  componentName: string;
  typescript?: boolean;
};

type SVGElement = Element;

type PropDefs = {
  [key: string]: {
    type: "number" | "string";
    defaultValue: any;
  };
};

const SKIPPED_TAGS = ["title", "desc", "defs"];

/**
 * Converts an SVG string into a string containing the contents of the
 * React component.
 */
export function convertSVGToComponent({
  componentName,
  contents,
  typescript,
}: ConvertSVGOpts) {

  // parse the XML of the SVG document into a JS object
  let struct = xml2js(contents, {
    ignoreDeclaration: true,
    ignoreComment: true,
  }) as SVGElement;

  // track where we will put our prop defs
  let genericColors: string[] = [];
  let props: PropDefs = {};

  // recurse over the elements in our SVG document to start building our props
  // and the JSX that will be returned by the component
  function walk(branch: SVGElement): SVGElement {
    let output: SVGElement = {};

    for (let key in branch) {
      switch (key) {
        case "elements":
          output.elements = branch.elements
            .filter(elementFilter)
            .map(walk);
          break;
        case "attributes":
          output.attributes = processAttributes(branch.attributes);
          break;
        case "name":
        case "type":
          output[key] = branch[key];
          break;
      }
    }
    return output;
  }

  // skip certain elements based on tag
  function elementFilter(el: SVGElement) {
    return (SKIPPED_TAGS.indexOf(el.name) === -1);
  }

  // format what attributes will remain on the JSX elements and build up
  function processAttributes(attrs: Attributes): Attributes {
    let output: Attributes = {};
    let prefix: string = (typeof attrs.id === "string" ? camelCase(attrs.id) : "");
    for (let key in attrs) {
      let token: string;
      switch (key) {
        case "id":
        case "xmlns:xlink":
          break;
        case "stroke":
        case "fill":
        case "color":
          if (prefix) {
            token = camelCase(prefix + "-" + key);
            props[token] = {
              type: "string",
              defaultValue: attrs[key],
            };
          } else {
            let i = genericColors.indexOf(attrs[key] as string);
            if (i === -1) {
              token = "color" + genericColors.length;
              genericColors.push(attrs[key] as string);
              props[token] = {
                type: "string",
                defaultValue: attrs[key],
              };
            } else {
              token = "color" + i;
            }
          }
          output[key] = `[[ ${token} ]]`;
          break;
        case "stroke-width":
          if (prefix) {
            token = camelCase(prefix + "-" + key);
            props[token] = {
              type: "number",
              defaultValue: parseFloat(attrs[key] as string),
            };
            output[camelCase(key)] = `[[ ${token} ]]`;
          } else {
            output[camelCase(key)] = attrs[key];
          }
          break;
        default:
          output[camelCase(key)] = attrs[key];
      }
    }
    return output;
  }

  // convert the updated structure back into an XML string
  let parsed = js2xml(walk(struct), {
    spaces: 2,
  });

  // parse out our custom tokens with JSX variable tokens
  parsed = parsed.replace(/"\[\[ (\w+) \]\]"/g, (m, token) => {
    return `{props.${token}}`;
  });

  // determine what template we're going to use
  let template = (typescript ? TEMPLATE_TS : "es6.html");

  // add additional tabbing to the SVG results for the return () blocks
  let svg = parsed.split("\n")
    .map(ln => "    " + ln)
    .join("\n");

  return nunjucks.renderString(template, {
    componentName,
    props,
    svg,
    stringify(val: any) {
      return (typeof val === "string" ? JSON.stringify(val) : val);
    },
  });
}