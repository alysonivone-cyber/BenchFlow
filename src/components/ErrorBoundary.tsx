import { Component, type ErrorInfo, type ReactNode } from "react";

// --------------------------------------------------
// ERROR BOUNDARY (R-01)
// Shows a recovery screen instead of a blank page when
// an error is thrown while React renders the interface.
// React only supports this through a class component.
// --------------------------------------------------

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  // Called by React while rendering: the returned object becomes the new state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  // Called after the error was caught: used only to log it for debugging.
  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("BenchFlow crashed while rendering:", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        >
          <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600">
            BenchFlow hit an unexpected error. Your protocols, sessions and notes stay saved on this device.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Reload the app
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Back to home
            </button>
          </div>
          <details className="mt-4 text-left text-xs text-slate-500">
            <summary className="cursor-pointer">Technical details</summary>
            <p className="mt-1 break-words">{error.message}</p>
          </details>
        </div>
      </div>
    );
  }
}
