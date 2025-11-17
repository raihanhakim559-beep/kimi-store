import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import { SearchBar } from "@/components/search-bar";

const pushMock = jest.fn();

const selectCommandItem = (element: Element) => {
  fireEvent.pointerDown(element);
  fireEvent.pointerUp(element);
  fireEvent.click(element);
};

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SearchBar", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    pushMock.mockClear();
    (globalThis.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              slug: "pulse-sync",
              title: "Pulse Sync",
              description: "Responsive runner",
              price: 180,
              currency: "USD",
              category: "Men",
              status: "new",
            },
          ],
        }),
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("opens the command dialog when the button is clicked", async () => {
    render(
      <SearchBar variant="command-button" placeholder="Search anything" />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /open product search/i }),
    );

    expect(await screen.findByRole("combobox")).toBeInTheDocument();
  });

  it("navigates to a product detail page when a result is selected", async () => {
    render(<SearchBar variant="command-button" />);

    fireEvent.click(
      screen.getByRole("button", { name: /open product search/i }),
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "Pulse" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/search?query=Pulse&limit=8",
      expect.objectContaining({ signal: expect.any(Object) }),
    );

    const resultTitle = await screen.findByText("Pulse Sync");
    const item = resultTitle.closest('[data-slot="command-item"]');
    expect(item).not.toBeNull();

    selectCommandItem(item!);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        { pathname: "/products/pulse-sync" },
        { locale: "en" },
      );
    });
  });

  it("can jump to the full search page for a query", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    });

    render(<SearchBar variant="command-button" />);

    fireEvent.click(
      screen.getByRole("button", { name: /open product search/i }),
    );

    const input = await screen.findByRole("combobox");
    fireEvent.change(input, { target: { value: "sandals" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const viewAllButton = await screen.findByText(
      /view all results for "sandals"/i,
    );

    const groupItem = viewAllButton.closest('[data-slot="command-item"]');
    expect(groupItem).not.toBeNull();

    selectCommandItem(groupItem!);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        { pathname: "/search", query: { query: "sandals" } },
        { locale: "en" },
      );
    });
  });

  it("submits the traditional form variant", async () => {
    render(<SearchBar defaultValue="Pulse" placeholder="Search products" />);

    const input = screen.getByRole("textbox", { name: /search products/i });
    fireEvent.change(input, { target: { value: "heels" } });

    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        { pathname: "/search", query: { query: "heels" } },
        { locale: "en" },
      );
    });
  });
});
