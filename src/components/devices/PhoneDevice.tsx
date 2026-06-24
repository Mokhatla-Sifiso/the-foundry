import { ASSISTANT_NAME } from "@/lib/constants";
type PhoneProps = Readonly<{
  assistantName?: string;
}>;
export function PhoneDevice({
  assistantName = ASSISTANT_NAME,
}: PhoneProps = {}): React.ReactElement {
  return (
    <>
      <div className="phone-notch" />
      <div className="phone-sb">
        <span>9:41</span>
        <span>AI · live</span>
      </div>
      <div className="phone-pad">
        <div className="ph-card">
          <div className="h">
            Daily PR review
            <span className="ai">{assistantName}</span>
          </div>
          <div className="ph-bul">
            <span className="d">›</span>3 PRs summarised — 1 needs your eyes
          </div>
          <div className="ph-bul">
            <span className="d">›</span>
            Flagged null-check in auth.ts
          </div>
          <div className="ph-bul">
            <span className="d">›</span>
            Tests drafted for session hook
          </div>
          <div className="ph-btn">Open review</div>
        </div>
      </div>
    </>
  );
}
