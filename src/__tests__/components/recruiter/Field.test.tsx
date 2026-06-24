import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/recruiter/Field";
describe("Field", () => {
  it("renders label + input with the supplied placeholder", () => {
    render(
      <Field
        name="name"
        label="Full name"
        placeholder="Jordan Pillay"
        value=""
        onChange={() => {}}
        icon={<svg data-testid="ic" />}
      />,
    );
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jordan Pillay")).toBeInTheDocument();
    expect(screen.getByTestId("ic")).toBeInTheDocument();
  });
  it("propagates typed values via onChange", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Field name="name" label="Full name" value="" onChange={onChange} icon={<svg />} />);
    await user.type(screen.getByLabelText("Full name"), "M");
    expect(onChange).toHaveBeenCalledWith("M");
  });
  it("toggles `.invalid` + shows the error message when error is set", () => {
    const { container, rerender } = render(
      <Field name="name" label="Full name" value="" onChange={() => {}} icon={<svg />} />,
    );
    expect(container.querySelector(".field.invalid")).toBeNull();
    rerender(
      <Field
        name="name"
        label="Full name"
        value=""
        onChange={() => {}}
        icon={<svg />}
        error="Please enter your full name."
      />,
    );
    expect(container.querySelector(".field.invalid")).not.toBeNull();
    expect(screen.getByText("Please enter your full name.")).toBeInTheDocument();
  });
});
