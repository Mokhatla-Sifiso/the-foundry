import { render } from "@testing-library/react";
import type { ConsentRecord } from "@/lib/privacy/consent";

const mockUseConsent = jest.fn();

jest.mock("@vercel/speed-insights/next", () => ({
  __esModule: true,
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));
jest.mock("@/components/privacy/ConsentProvider", () => ({
  useConsent: () => mockUseConsent(),
}));

import { SpeedInsights } from "@/components/analytics/SpeedInsights";

function record(analytics: boolean): ConsentRecord {
  return { v: "1", ts: 0, choices: { necessary: true, functional: false, analytics } };
}

describe("SpeedInsights", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing until analytics consent is granted", () => {
    mockUseConsent.mockReturnValue({ record: record(false) });
    const { queryByTestId } = render(<SpeedInsights />);
    expect(queryByTestId("vercel-speed-insights")).toBeNull();
  });

  it("renders nothing while consent is unresolved", () => {
    mockUseConsent.mockReturnValue({ record: null });
    const { queryByTestId } = render(<SpeedInsights />);
    expect(queryByTestId("vercel-speed-insights")).toBeNull();
  });

  it("mounts Vercel Speed Insights once analytics consent is granted", () => {
    mockUseConsent.mockReturnValue({ record: record(true) });
    const { getByTestId } = render(<SpeedInsights />);
    expect(getByTestId("vercel-speed-insights")).toBeInTheDocument();
  });

  it("unmounts it when analytics consent is withdrawn", () => {
    mockUseConsent.mockReturnValue({ record: record(true) });
    const { queryByTestId, rerender } = render(<SpeedInsights />);
    expect(queryByTestId("vercel-speed-insights")).toBeInTheDocument();
    mockUseConsent.mockReturnValue({ record: record(false) });
    rerender(<SpeedInsights />);
    expect(queryByTestId("vercel-speed-insights")).toBeNull();
  });
});
