export function Laptop(): React.ReactElement {
  return (
    <>
      <div className="laptop-lid">
        <span className="laptop-cam" aria-hidden="true" />
        <div className="laptop-scr vsc">
          <div className="vsc-bar">
            <span className="vsc-tl r" />
            <span className="vsc-tl y" />
            <span className="vsc-tl g" />
            <span className="vsc-fn">guest.ts — the-foundry</span>
          </div>
          <div className="vsc-body">
            <div className="vsc-act" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="on" fill="currentColor">
                <path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h12v2H3z" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 2 3 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6z" />
              </svg>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
              </svg>
            </div>
            <div className="vsc-tree" aria-hidden="true">
              <div className="vsc-tt">Access</div>
              <div className="vsc-f">email.ts</div>
              <div className="vsc-f sel">guest.ts</div>
              <div className="vsc-f">executive.ts</div>
              <div className="vsc-f">otp.ts</div>
              <div className="vsc-f">entitlement.ts</div>
            </div>
            <div className="vsc-code" aria-hidden="true">
              <div className="vsc-ln">
                <span className="g">18</span>
                <span>
                  <span className="kw">export async function</span>{" "}
                  <span className="fn">createGuestRequest</span>(<span className="var">args</span>) {"{"}
                </span>
              </div>
              <div className="vsc-ln">
                <span className="g">19</span>
                <span>
                  {"  "}
                  <span className="kw">const</span> <span className="var">token</span> ={" "}
                  <span className="fn">newReviewToken</span>()
                </span>
              </div>
              <div className="vsc-ln">
                <span className="g">20</span>
                <span>
                  {"  "}
                  <span className="kw">await</span> <span className="var">db</span>.accessRequest.
                  <span className="fn">create</span>({"{"}
                </span>
              </div>
              <div className="vsc-ln">
                <span className="g">21</span>
                <span>
                  {"    "}
                  data: {"{"} tier: <span className="str">&quot;guest&quot;</span>, token {"}"},
                </span>
              </div>
              <div className="vsc-ln ghost">
                <span className="g">22</span>
                <span>
                  {"    "}
                  <span className="cm">{"// notify owner + send receipt"}</span>
                  <span className="tab">Tab ⇥</span>
                </span>
              </div>
              <div className="vsc-ln">
                <span className="g">23</span>
                <span>{"  })"}</span>
              </div>
            </div>
          </div>
          <div className="vsc-status">
            <span className="br">feat/v1-access-system</span>
            <span>✓ 0 problems</span>
            <span className="sp">TypeScript · Prettier</span>
          </div>
        </div>
      </div>
      <div className="laptop-base">
        <div className="laptop-notch" />
      </div>
    </>
  );
}
