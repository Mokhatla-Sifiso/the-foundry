import { render, screen } from "@testing-library/react";
import { ServiceCard } from "@/components/sections/ServiceCard";
import type { Service } from "@/lib/constants";

const FIXTURE: Service = {
  titleLineOne: "Microfrontend",
  titleLineTwo: "Architecture",
  body: "Federated module boundaries that let independent teams ship without stepping on each other.",
  capabilities: ["Module federation rollout", "Cross-team contract design", "Versioned shared shells"],
};

describe("ServiceCard", () => {
  it("renders both title lines split across a <br>", () => {
    render(<ServiceCard service={FIXTURE} index={0} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.textContent).toContain(FIXTURE.titleLineOne);
    expect(heading.textContent).toContain(FIXTURE.titleLineTwo);
  });

  it("renders the body paragraph", () => {
    render(<ServiceCard service={FIXTURE} index={0} />);
    expect(screen.getByText(FIXTURE.body)).toBeInTheDocument();
  });

  it("renders every capability as its own list item", () => {
    render(<ServiceCard service={FIXTURE} index={0} />);
    const list = screen.getByRole("list", {
      name: `${FIXTURE.titleLineOne} capabilities`,
    });
    const items = list.querySelectorAll("li");
    expect(items.length).toBe(FIXTURE.capabilities.length);
    for (const capability of FIXTURE.capabilities) {
      expect(screen.getByText(capability)).toBeInTheDocument();
    }
  });

  it("derives a stable heading id from the index for label-by association", () => {
    render(<ServiceCard service={FIXTURE} index={2} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.id).toBe("service-2-heading");

    const group = screen.getByRole("group");
    expect(group.getAttribute("aria-labelledby")).toBe("service-2-heading");
  });
});
