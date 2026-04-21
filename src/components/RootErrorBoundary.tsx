import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  componentStack: string;
}

/**
 * Root-level error boundary so a render-time crash never shows a blank screen.
 * Prints the failing component stack so we can pinpoint which subtree caused it
 * even in production builds.
 */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
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
    return this.props.children;
  }
}
