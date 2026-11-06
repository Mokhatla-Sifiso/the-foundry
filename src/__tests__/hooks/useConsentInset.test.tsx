import { render } from "@testing-library/react";
import { useRef } from "react";
import { CONSENT_BANNER_ID, useConsent } from "@/components/privacy/ConsentProvider";
import { CONSENT_INSET_VAR, useConsentInset } from "@/hooks/useConsentInset";

jest.mock("@/components/privacy/ConsentProvider", () => ({
  ...jest.requireActual("@/components/privacy/ConsentProvider"),
  useConsent: jest.fn(),
}));

const consent = useConsent as jest.Mock;
let resize: (() => void) | null = null;

function Stage(): React.ReactElement {
  const stage = useRef<HTMLDivElement>(null);
  useConsentInset(stage);
  return <div ref={stage} data-testid="stage" />;
}

function mountBanner(height: number): HTMLElement {
  const banner = document.createElement("aside");
  banner.id = CONSENT_BANNER_ID;
  Object.defineProperty(banner, "offsetHeight", { configurable: true, value: height });
  document.body.appendChild(banner);
  return banner;
}

beforeEach(() => {
  global.ResizeObserver = class {
    constructor(cb: () => void) {
      resize = cb;
    }
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {
      resize = null;
    }
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  document.getElementById(CONSENT_BANNER_ID)?.remove();
});

describe("useConsentInset", () => {
  it("gives the stage's bottom to the open banner, plus its gap", () => {
    consent.mockReturnValue({ resolved: false, open: false });
    mountBanner(187);
    const { getByTestId } = render(<Stage />);
    expect(getByTestId("stage").style.getPropertyValue(CONSENT_INSET_VAR)).toBe("211px");
  });

  it("follows the banner when its height changes", () => {
    consent.mockReturnValue({ resolved: true, open: true });
    const banner = mountBanner(187);
    const { getByTestId } = render(<Stage />);
    Object.defineProperty(banner, "offsetHeight", { configurable: true, value: 420 });
    resize?.();
    expect(getByTestId("stage").style.getPropertyValue(CONSENT_INSET_VAR)).toBe("444px");
  });

  it("returns the space when the banner closes", () => {
    consent.mockReturnValue({ resolved: false, open: false });
    mountBanner(187);
    const { getByTestId, rerender } = render(<Stage />);
    consent.mockReturnValue({ resolved: true, open: false });
    rerender(<Stage />);
    expect(getByTestId("stage").style.getPropertyValue(CONSENT_INSET_VAR)).toBe("");
    expect(resize).toBeNull();
  });

  it("leaves the stage alone when a choice is on record", () => {
    consent.mockReturnValue({ resolved: true, open: false });
    mountBanner(187);
    const { getByTestId } = render(<Stage />);
    expect(getByTestId("stage").style.getPropertyValue(CONSENT_INSET_VAR)).toBe("");
  });
});
