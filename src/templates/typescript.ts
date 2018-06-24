export const TEMPLATE_TS =
  `import * as React from "react";

export type {{ componentName }}Props = {
  {% for name, desc in props %}{{ name }}?: {{ desc.type }};
  {% endfor %}
};

export function {{ componentName }}(props: {{ componentName }}Props) {
  return (
{{ svg | safe }}
  );
}

export namespace {{ componentName }} {
  export const defaultProps = {
    {% for name, desc in props %}{{ name }}: {{ stringify(desc.defaultValue) | safe }},
    {% endfor %}
  };
}`;