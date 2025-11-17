import "@testing-library/jest-dom";

import { jest } from "@jest/globals";

jest.mock("next/cache", () => ({
  unstable_noStore: () => {},
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  // @ts-expect-error - jsdom doesn't define ResizeObserver
  globalThis.ResizeObserver = ResizeObserver;
}

if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    constructor(type, params = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tangentialPressure = params.tangentialPressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.twist = params.twist ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
      this.isPrimary = params.isPrimary ?? true;
    }
  }

  // @ts-expect-error - define globally for jsdom
  globalThis.PointerEvent = PointerEventPolyfill;
}
