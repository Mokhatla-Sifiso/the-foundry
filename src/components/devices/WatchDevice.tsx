/**
 * Watch mockup — VERBATIM markup + content from §8.3. Candy ring with
 * progress arc (CSS `::before`), 99.8% uptime readout, label "Uptime".
 */
export function WatchDevice(): React.ReactElement {
  return (
    <div className="watch">
      <div className="watch-ring">
        <span className="watch-val">99.8%</span>
      </div>
      <div className="watch-lbl">Uptime</div>
    </div>
  );
}
