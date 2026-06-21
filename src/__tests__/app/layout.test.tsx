import { metadata } from "@/app/layout";

/**
 * RootLayout renders <html>/<body>, which RTL can't host in its
 * detached <div>. Structural assertions are covered by `next build`
 * + the dev-server smoke fetch; here we just lock the exported
 * metadata contract.
 */
describe("RootLayout metadata", () => {
  it("publishes the spec title with a templated suffix", () => {
    expect(metadata.title).toEqual(
      expect.objectContaining({
        default: expect.stringMatching(/Mzwakhe Mokhatla/),
        template: expect.stringMatching(/Mzwakhe Mokhatla/),
      }),
    );
  });

  it("uses the spec tagline as the description", () => {
    expect(metadata.description).toMatch(/Turning ideas into digital realities/);
  });

  it("opts into indexing", () => {
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
