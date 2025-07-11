import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "@/app/(protected)/(auth)/register/page";
import "@testing-library/jest-dom";

// ✅ Mock useRouter from App Router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// ✅ Mock Navbar and Footer to prevent layout errors
jest.mock("@/components/Navbar", () => () => <div data-testid="navbar" />);
jest.mock("@/components/Footer", () => () => <div data-testid="footer" />);

// ✅ Set a fake environment variable
process.env.NEXT_PUBLIC_AUTH_API_URL = "http://localhost:8080";

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders and accepts input for full name, email, and password", () => {
    render(<RegisterPage />);

    const fullNameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(fullNameInput, { target: { value: "Neelam" } });
    fireEvent.change(emailInput, { target: { value: "neelam@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(fullNameInput).toHaveValue("Neelam");
    expect(emailInput).toHaveValue("neelam@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows error for invalid email", async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "bad-email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: "Neelam" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it("shows success message and redirects on valid registration", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: async () => "Registered successfully",
      })
    ) as jest.Mock;

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: "Neelam" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "neelam@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it("shows server error on failed registration", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: async () => "Email already exists",
      })
    ) as jest.Mock;

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: "Neelam" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "neelam@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
