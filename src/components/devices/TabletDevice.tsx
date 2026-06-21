import { ASSISTANT_NAME } from "@/lib/constants";

type TabletProps = Readonly<{ assistantName?: string }>;

/**
 * Tablet mockup — VERBATIM markup + content from §8.4. Weekly Report
 * header, two stat tiles (Lines / Revenue), progress bar at 72%,
 * and a digest footer crediting the assistant by name.
 *
 * Returns only inner content. The `.tablet` wrapper with its
 * `position: absolute; bottom:10px; right:-40px; width:220px; …` is
 * supplied by `<Reveal className="tablet">` in AISection per §8.4.
 */
export function TabletDevice({ assistantName = ASSISTANT_NAME }: TabletProps = {}): React.ReactElement {
  return (
    <>
      <div className="tablet-scr">
        <div className="tab-head">
          Weekly Report
          <span className="tbg">This week</span>
        </div>
        <div className="tab-stats">
          <div className="tab-st">
            <div className="tn">1.8k</div>
            <div className="tl">Lines</div>
          </div>
          <div className="tab-st">
            <div className="tn">R312k</div>
            <div className="tl">Revenue</div>
          </div>
        </div>
        <div className="tab-bar">
          <div />
        </div>
        <div className="tab-digest">
          <i />
          {assistantName} weekly digest
        </div>
      </div>
    </>
  );
}
