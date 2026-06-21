import { metadata } from "@/app/layout";

/*
 * RootLayout renders <html> and <body>, which React Testing Library can't host
 * inside its detached <div> container. Behavior worth asserting at the unit
 * level lives in the exported metadata; structural rendering is covered by
 * `next build` + e2e tests in later PRs.
 */
describe("RootLayout metadata", () => {
  it("publishes the studio title with a templated suffix", () => {
    expect(metadata.title).toEqual(
      expect.objectContaining({
        default: expect.stringMatching(/Mzwakhe Mokhatla/),
        template: expect.stringMatching(/Mzwakhe Mokhatla/),
      }),
    );
  });

  it("exposes a description and OpenGraph block for crawlers", () => {
    expect(metadata.description).toMatch(/Software engineer/);
    expect(metadata.openGraph?.title).toMatch(/Mzwakhe Mokhatla/);
  });

  it("opts into indexing", () => {
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
