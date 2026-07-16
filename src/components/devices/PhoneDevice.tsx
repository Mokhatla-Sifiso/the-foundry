import { IconClaude } from "@/components/primitives/brandIcons";

export function PhoneDevice(): React.ReactElement {
  return (
    <>
      <span className="phone-island" aria-hidden="true" />
      <div className="phone-sb">
        <span>9:41</span>
        <span>CLI</span>
      </div>
      <div className="phone-pad">
        <div className="cl-head">
          <span className="cl-mark" aria-hidden="true">
            <IconClaude />
          </span>
          <span className="cl-nm">Claude</span>
          <span className="cl-st">pairing</span>
        </div>
        <div className="cl-conv">
          <div className="cl-bub u">
            Pull OTP send/verify out of the guest &amp; executive routes into one shared helper.
          </div>
          <div className="cl-bub a">
            Done — extracted <b>startOtp</b> / <b>verifyOtp</b> into <code>lib/access/otp.ts</code>;
            both routes call it now.
            <span className="cl-snip">
              + src/lib/access/otp.ts
              <br />~ api/guest · api/executive
            </span>
          </div>
          <div className="cl-bub u">Good. Now add tests to clear the coverage gate.</div>
        </div>
        <div className="cl-foot">I read every diff before it lands.</div>
      </div>
    </>
  );
}
