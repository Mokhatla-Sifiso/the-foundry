/**
 * Watch mockup — VERBATIM markup + content from §8.3. Candy ring with
 * progress arc (CSS `::before`), 99.8% uptime readout, label "Uptime".
 *
 * Returns only inner content. The `.watch` wrapper with its
 * `position: absolute; bottom:30px; left:-50px; width:110px; …` is
 * supplied by `<Reveal className="watch">` in AISection per §8.3.
 */
export function WatchDevice(): React.ReactElement {
  return (
    <>
      <div className="watch-ring">
        <span className="watch-val">99.8%</span>
      </div>
      <div className="watch-lbl">Uptime</div>
    </>
  );
}
