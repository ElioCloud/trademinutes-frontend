/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page"; // Adjust import if file path differs
import { useRouter } from "next/navigation";

// Mock next/router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth signIn
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
  });
  localStorage.clear();
});

describe("LoginPage Component", () => {
  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Login to TradeMinutes/i })
    ).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ error: "Invalid credentials" }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Login to TradeMinutes/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("redirects on successful login", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ token: "fake-token" }),
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "correctpass" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Login to TradeMinutes/i })
    );

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
