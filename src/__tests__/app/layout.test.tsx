import { metadata } from "@/app/layout";
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
