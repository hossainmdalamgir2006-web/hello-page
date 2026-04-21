import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  componentStack: string;
  recoveryKey: number;
}

/**
 * Root-level error boundary so a render-time crash never shows a blank screen.
 *
 * Special handling for the well-known React 18 + Radix Portal `removeChild`
 * race condition: when third-party scripts (GA4/GTM/Pixel) or portals get
 * detached out-of-order during route transitions, React throws
 * `NotFoundError: Failed to execute 'removeChild' on 'Node'`. The DOM is
 * already in the desired state — we simply force a re-mount with a fresh key
 * so the user never sees the error screen.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: "", recoveryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Auto-recover from benign DOM reconciliation races.
    const isRemoveChildRace =
      error.name === "NotFoundError" &&
      /removeChild/i.test(error.message ?? "");
    if (isRemoveChildRace) {
      return { error: null };
    }
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const isRemoveChildRace =
      error.name === "NotFoundError" &&
      /removeChild/i.test(error.message ?? "");

    if (isRemoveChildRace) {
      // Silent recovery — bump key to force a clean re-mount of the subtree.
      // eslint-disable-next-line no-console
      console.warn("[RootErrorBoundary] Recovered from removeChild race.");
      this.setState((s) => ({ error: null, recoveryKey: s.recoveryKey + 1 }));
      return;
    }

    this.setState({ componentStack: info.componentStack || "" });
    // eslint-disable-next-line no-console
    console.error("[RootErrorBoundary] Caught:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-2xl w-full space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-destructive">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              The app hit an unexpected error. You can reload to try again.
            </p>
            <details className="text-xs bg-muted rounded p-3 overflow-auto max-h-64">
              <summary className="cursor-pointer font-mono mb-2">{this.state.error.name}: {this.state.error.message}</summary>
              <pre className="whitespace-pre-wrap break-words mt-2">{this.state.componentStack}</pre>
            </details>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.recoveryKey} className="contents">{this.props.children}</div>;
  }
}
