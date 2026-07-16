import { render } from "@testing-library/react";
import type { ConsentRecord } from "@/lib/privacy/consent";

const mockUseConsent = jest.fn();
const gaPageViewSpy = jest.fn();
const setGaDisabledSpy = jest.fn();
const clearGaCookiesSpy = jest.fn();
let mockPathname = "/";

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({
    children,
    src,
    id,
  }: {
    children?: React.ReactNode;
    src?: string;
    id?: string;
  }) =>
    src ? (
      <script data-testid={id} data-src={src} />
    ) : (
      <script data-testid={id}>{children}</script>
    ),
}));
jest.mock("next/navigation", () => ({ usePathname: () => mockPathname }));
jest.mock("@/components/privacy/ConsentProvider", () => ({
  useConsent: () => mockUseConsent(),
}));
jest.mock("@/lib/analytics/ga", () => ({
  GA_MEASUREMENT_ID: "G-TEST12345",
  isGaConfigured: () => true,
  gaPageView: (path: string) => gaPageViewSpy(path),
  setGaDisabled: (v: boolean) => setGaDisabledSpy(v),
  clearGaCookies: () => clearGaCookiesSpy(),
}));

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

function record(analytics: boolean): ConsentRecord {
  return { v: "1", ts: 0, choices: { necessary: true, functional: false, analytics } };
}

describe("GoogleAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/";
  });

  it("renders no gtag scripts until analytics consent is granted", () => {
    mockUseConsent.mockReturnValue({ record: record(false) });
    const { queryByTestId } = render(<GoogleAnalytics />);
    expect(queryByTestId("ga-src")).toBeNull();
    expect(queryByTestId("ga-init")).toBeNull();
  });

  it("renders no gtag scripts when consent is unresolved", () => {
    mockUseConsent.mockReturnValue({ record: null });
    const { queryByTestId } = render(<GoogleAnalytics />);
    expect(queryByTestId("ga-src")).toBeNull();
  });

  it("loads the gtag loader + init once analytics consent is granted", () => {
    mockUseConsent.mockReturnValue({ record: record(true) });
    const { getByTestId } = render(<GoogleAnalytics nonce="n1" />);
    expect(getByTestId("ga-src").getAttribute("data-src")).toContain(
      "googletagmanager.com/gtag/js?id=G-TEST12345",
    );
    expect(getByTestId("ga-init").textContent).toContain("gtag('config','G-TEST12345'");
  });

  it("skips the first view but tracks subsequent client navigations", () => {
    mockUseConsent.mockReturnValue({ record: record(true) });
    const { rerender } = render(<GoogleAnalytics />);
    expect(gaPageViewSpy).not.toHaveBeenCalled();
    mockPathname = "/legal/cookies";
    rerender(<GoogleAnalytics />);
    expect(gaPageViewSpy).toHaveBeenCalledWith("/legal/cookies");
  });

  it("disables GA and clears its cookies when consent is withdrawn", () => {
    mockUseConsent.mockReturnValue({ record: record(true) });
    const { rerender } = render(<GoogleAnalytics />);
    mockUseConsent.mockReturnValue({ record: record(false) });
    rerender(<GoogleAnalytics />);
    expect(setGaDisabledSpy).toHaveBeenCalledWith(true);
    expect(clearGaCookiesSpy).toHaveBeenCalled();
  });
});
