import "@testing-library/jest-dom";

import { jest } from "@jest/globals";

jest.mock("next/cache", () => ({
  unstable_noStore: () => {},
}));
