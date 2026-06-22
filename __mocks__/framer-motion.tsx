import React from "react";

/*
 * Manual mock auto-discovered by Jest when a suite calls
 * `jest.mock("framer-motion")`. Strips framer-only props from `motion.<tag>`
 * components so jsdom doesn't choke on unknown DOM attributes, and replaces
 * the scroll/spring hooks with passthrough stubs. Suites that care about
 * actual animation behaviour should use a per-suite factory mock instead.
 */

const ANIMATION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "layoutDependency",
  "layoutScroll",
  "drag",
  "dragConstraints",
  "dragElastic",
  "onAnimationStart",
  "onAnimationComplete",
  "onHoverStart",
  "onHoverEnd",
  "onTap",
  "onTapStart",
  "onTapCancel",
  "onPan",
  "onPanStart",
  "onPanEnd",
  "onDragStart",
  "onDragEnd",
  "onDrag",
  "onUpdate",
  "transformTemplate",
  "custom",
]);

type AnyProps = Record<string, unknown> & { children?: React.ReactNode };

function stripAnimationProps(props: AnyProps): AnyProps {
  const cleaned: AnyProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ANIMATION_PROPS.has(key)) cleaned[key] = value;
  }
  return cleaned;
}

const motionFactory = new Proxy(
  {},
  {
    get(_target, tag: string) {
      const Component = (props: AnyProps) =>
        React.createElement(tag, stripAnimationProps(props), props.children);
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  },
);

const passthroughMotionValue = <T,>(value: T) => ({
  get: () => value,
  set: () => {},
  on: () => () => {},
  destroy: () => {},
});

export const motion = motionFactory;

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);

export const useScroll = () => ({
  scrollY: passthroughMotionValue(0),
  scrollYProgress: passthroughMotionValue(0),
  scrollX: passthroughMotionValue(0),
  scrollXProgress: passthroughMotionValue(0),
});

export const useSpring = <T,>(value: T) => value;
export const useTransform = <T,>(_input: unknown, _from: unknown, to: T[]) => to[0];
export const useMotionValue = <T,>(value: T) => passthroughMotionValue(value);
export const useInView = () => true;
export const useReducedMotion = () => false;
export const useAnimation = () => ({ start: () => Promise.resolve(), stop: () => {} });
