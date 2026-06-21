type DotsProps = Readonly<{
  /** 0-based index of the active step (0..3). */
  step: number;
  /** Total dots — defaults to 4 (gate/signup → otp → screening → approved). */
  total?: number;
}>;

/**
 * Progress dots — VERBATIM markup from §11. Each `<i>` is a flex-1 bar
 * that lights up candy when `on`, green when `done`.
 */
export function Dots({ step, total = 4 }: DotsProps): React.ReactElement {
  return (
    <div className="dots">
      {Array.from({ length: total }, (_, i) => {
        const cls = i < step ? "done" : i === step ? "on" : "";
        return <i key={i} className={cls} />;
      })}
    </div>
  );
}
