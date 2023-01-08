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
  wipRoot = {
    props: { children: [element] },
    dom: container,
    alternative: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  requestIdleCallback(workLoop);
}

let wipRoot;
let currentRoot;
let nextUnitOfWork;

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.firstChild);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    getParentDom(fiber).appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE") {
    updateDom(fiber.dom, fiber.alternative.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, getParentDom(fiber));
    getParentDom(fiber).removeChild(fiber.dom);
  }

  deletions.forEach((it) => {
    getParentDom(it).remove(it.dom);
  });
  deletions = [];
  commitWork(fiber.firstChild);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, parentDom) {
  if (fiber.dom) {
    parentDom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.firstChild, parentDom);
  }
}

function getParentDom(fiber) {
  let parent = fiber.parent;

  while (parent && !parent.dom) {
    parent = parent.parent;
  }

  if (parent) {
    return parent.dom;
  } else {
    return null;
  }
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const toEventType = (key) => key.substring(2).toLowerCase();

function updateDom(dom, prevProps, nextProps) {
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = "";
    });

  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || nextProps[key] !== prevProps[key])
    .map(toEventType)
    .forEach((eventType) => {
      dom.removeEventListener(eventType, prevProps[eventType]);
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = nextProps[key];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .map(toEventType)
    .forEach((eventType) => {
      dom.addEventListener(eventType, nextProps[eventType]);
    });
}

function performUnitOfWork(fiber) {
  if (fiber.type instanceof Function) {
    reconcileChildren(fiber, [fiber.type(fiber.props)]);
  } else {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }

    reconcileChildren(fiber, fiber.props?.children);
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

let deletions = [];

function reconcileChildren(fiber, children) {
  let prev = null;
  let oldFiber = fiber.alternative?.firstChild;
  let index = 0;

  while ((children && index < children.length) || oldFiber) {
    let element;
    if (children && index < children.length) {
      element = children[index];
    }

    const isSameType = oldFiber && oldFiber.type === element.type;

    let curr;

    if (isSameType) {
      curr = {
        props: element.props,
        type: element.type,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        alternative: oldFiber,
        effectTag: "UPDATE",
      };
    } else if (!isSameType && element) {
      curr = {
        props: element.props,
        type: element.type,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: "PLACEMENT",
      };
    } else if (oldFiber) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (prev === null) {
      fiber.firstChild = curr;
    } else {
      prev.sibling = curr;
    }

    prev = curr;

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    index++;
  }
}

function createDom(fiber) {
  const dom =
    fiber.type === TYPE_TEXT_ELEMENT
      ? document.createTextNode(fiber.props.nodeValue)
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

export const Airy = { createElement, createTextElement, render };
