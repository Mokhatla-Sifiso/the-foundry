import { metadata } from "@/app/layout";

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
