type DotsProps = Readonly<{
  step: number;
  total?: number;
}>;
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
