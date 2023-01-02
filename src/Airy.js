const TYPE_TEXT_ELEMENT = "TEXT_ELEMENT";
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: TYPE_TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type === TYPE_TEXT_ELEMENT
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(element.type);
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((prop) => {
      dom[prop] = element.props[prop];
    });

  element.props?.children?.forEach((child) => {
    render(child, dom);
  });

  container.appendChild(dom);
}

export const Airy = { createElement, createTextElement, render };
