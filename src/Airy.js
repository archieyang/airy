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
  nextUnitOfWork = { props: { children: [element] }, dom: container };
  requestIdleCallback(workLoop);
}

let nextUnitOfWork;

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  let prev = null;

  for (const child of fiber.props?.children) {
    const curr = {
      props: child.props,
      type: child.type,
      dom: null,
      parent: fiber,
      sibling: null,
    };

    if (prev === null) {
      fiber.firstChild = curr;
    } else {
      prev.sibling = curr;
    }

    prev = curr;
  }

  let nextFiber = null;
  if (fiber.firstChild) {
    nextFiber = fiber.firstChild;
  } else if (fiber.sibling) {
    nextFiber = fiber.sibling;
  } else {
    while (fiber) {
      if (fiber.parent && fiber.parent.sibling) {
        nextFiber = fiber.parent.sibling;
        break;
      } else {
        fiber = fiber.parent;
      }
    }
  }

  return nextFiber;
}

function createDom(fiber) {
  console.log(`${fiber.type}`);
  const dom =
    fiber.type === TYPE_TEXT_ELEMENT
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);
  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((prop) => {
      dom[prop] = fiber.props[prop];
    });

  fiber.parent.dom.appendChild(dom);

  return dom;
}

export const Airy = { createElement, createTextElement, render };
