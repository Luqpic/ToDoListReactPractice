import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import SignupPage from "./SignupPage";

// SignupPage calls useNavigate and useAuth, so it needs the same router and
// auth providers it gets from main.tsx/App.tsx in the real app.
function renderSignup() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe("SignupPage", () => {
  it("shows field errors when submitted empty", async () => {
    const user = renderSignup();

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("Invalid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters long"),
    ).toBeInTheDocument();
  });

  it("shows a mismatch error when the passwords differ", async () => {
    const user = renderSignup();

    await user.type(screen.getByPlaceholderText("email"), "new@example.com");
    await user.type(screen.getByPlaceholderText("password"), "Passw0rd");
    await user.type(
      screen.getByPlaceholderText("confirm password"),
      "Different1",
    );
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });
});
