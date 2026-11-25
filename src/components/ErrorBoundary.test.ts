import { describe, expect, it } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  it("keeps the error thrown while rendering so the recovery screen can be shown", () => {
    const error = new Error("boom");
    expect(ErrorBoundary.getDerivedStateFromError(error)).toEqual({ error });
  });
});
