import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { NotifyDialog } from "@/components/upgrades/NotifyDialog";

// jsdom has <dialog> and its `open` attribute but not the modal methods; these stand in for them.
const showModal = jest.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const close = jest.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});
const originalFetch = global.fetch;
const fetchMock = jest.fn();

/** jsdom has no Response; the hook reads only the status and the JSON body. */
function jsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = showModal;
  HTMLDialogElement.prototype.close = close;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = fetchMock;
  document.body.style.overflow = "";
});

/** The gate's wiring: a button that opens the dialog. */
function Harness(): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Notify me when the updates are done
      </button>
      <NotifyDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function openDialog(): HTMLDialogElement {
  const opener = screen.getByRole("button", { name: "Notify me when the updates are done" });
  opener.focus();
  fireEvent.click(opener);
  return document.querySelector("dialog") as HTMLDialogElement;
}

async function signUp(): Promise<void> {
  fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 202));
  fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), {
    target: { value: "Name@Company.com" },
  });
  fireEvent.click(screen.getByRole("checkbox", { name: /Email me once/ }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Notify me" }));
  });
}

describe("NotifyDialog", () => {
  it("stays closed until opened", () => {
    render(<Harness />);
    expect(document.querySelector("dialog")).not.toHaveAttribute("open");
    expect(showModal).not.toHaveBeenCalled();
  });

  it("opens as a modal named by its title, with focus in the email field and the page still", () => {
    render(<Harness />);
    const dialog = openDialog();
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(dialog).toHaveAccessibleName("Get one email when it's live");
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape, returning focus to the button that opened it and the scroll to the page", () => {
    render(<Harness />);
    const dialog = openDialog();
    // Escape on a modal dialog ends in its close event, as the close button does.
    act(() => dialog.close());
    expect(dialog).not.toHaveAttribute("open");
    expect(
      screen.getByRole("button", { name: "Notify me when the updates are done" }),
    ).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes from its close button", () => {
    render(<Harness />);
    const dialog = openDialog();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog).not.toHaveAttribute("open");
  });

  it("confirms a sign-up in the same words for every address, focusing the confirmation", async () => {
    render(<Harness />);
    const dialog = openDialog();
    await signUp();
    const heading = screen.getByRole("heading", { name: "Check your inbox" });
    expect(heading).toHaveFocus();
    expect(dialog).toHaveAccessibleName("Check your inbox");
    // jsdom's name computation adds a space after the inline <strong>; browsers do not.
    expect(dialog).toHaveAccessibleDescription(
      /^If this address still needs confirming, a link is on its way to name@company\.com ?\. It expires in 48 hours\.$/,
    );
  });

  it("closes from Done, and opens again with an empty form", async () => {
    render(<Harness />);
    const dialog = openDialog();
    await signUp();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(dialog).not.toHaveAttribute("open");
    openDialog();
    expect(screen.getByRole("textbox", { name: "Email address" })).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: /Email me once/ })).not.toBeChecked();
  });

  it("closes when the gate closes it", () => {
    const { rerender } = render(<NotifyDialog open onClose={() => {}} />);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).toHaveAttribute("open");
    rerender(<NotifyDialog open={false} onClose={() => {}} />);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
