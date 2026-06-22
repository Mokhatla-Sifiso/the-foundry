// Lightweight event bus so StackScaleEffect can consume Lenis's float
// scroll value directly from the Lenis RAF loop, avoiding the integer
// rounding of window.scrollY that causes the sticky-lock snap.

type Cb = (scroll: number) => void;
const subs: Cb[] = [];

export const lenisBus = {
  emit(scroll: number): void {
    for (const fn of subs) fn(scroll);
  },
  on(fn: Cb): () => void {
    subs.push(fn);
    return (): void => {
      const i = subs.indexOf(fn);
      if (i !== -1) subs.splice(i, 1);
    };
  },
};
