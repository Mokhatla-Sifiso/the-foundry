export function WatchDevice(): React.ReactElement {
  return (
    <>
      <div className="watch-scr">
        <div className="watch-ok" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="watch-lbl">CI passing</div>
      </div>
      <span className="watch-crown" aria-hidden="true" />
    </>
  );
}
