import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "@/app/(protected)/(auth)/login/page";

// ✅ Mock router
const pushMock = jest.fn();
const replaceMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

// ✅ Mock signIn from next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// ✅ Mock components
jest.mock("@/components/Navbar", () => () => <div data-testid="navbar" />);
jest.mock("@/components/Footer", () => () => <div data-testid="footer" />);
jest.mock("@/components/Testimonials", () => () => (
  <div data-testid="testimonials" />
));

// ✅ Set up fake API URL
process.env.NEXT_PUBLIC_AUTH_API_URL = "http://localhost:8080";

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(
      screen.getByPlaceholderText(/enter your email address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login to trademinutes/i })
    ).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ error: "Invalid credentials" }),
      })
    ) as jest.Mock;

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /login to trademinutes/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    );
  });

  it("logs in successfully and redirects", async () => {
    jest.useFakeTimers(); // ⏱️ simulate setTimeout

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ token: "fake-token" }),
      })
    ) as jest.Mock;

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "neelam@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /login to trademinutes/i })
    );

    // Wait for token to be saved
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
    });

    // Simulate the delay before redirect
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });

    jest.useRealTimers(); // reset timers
  });
});
