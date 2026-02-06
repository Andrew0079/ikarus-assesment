import { Component, ReactNode } from "react";
import { Block } from "baseui/block";
import { Button } from "baseui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches React rendering errors
 * and displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // In production, you could send this to an error tracking service like Sentry
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Block
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          padding="scale800"
          backgroundColor="backgroundPrimary"
        >
          <Block
            maxWidth="500px"
            padding="scale800"
            backgroundColor="backgroundSecondary"
            $style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <Block
              as="h1"
              font="font650"
              color="contentPrimary"
              marginBottom="scale600"
              $style={{ margin: 0 }}
            >
              Oops! Something went wrong
            </Block>
            
            <Block
              font="font300"
              color="contentSecondary"
              marginBottom="scale800"
            >
              We're sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </Block>

            {this.state.error && (
              <Block
                marginBottom="scale800"
                padding="scale600"
                backgroundColor="backgroundTertiary"
                $style={{
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  textAlign: "left",
                  overflowX: "auto",
                }}
              >
                <Block font="font100" color="contentTertiary">
                  {this.state.error.toString()}
                </Block>
              </Block>
            )}

            <Block display="flex" justifyContent="center" gridGap="scale400">
              <Button onClick={this.handleReset} kind="secondary">
                Try Again
              </Button>
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
            </Block>
          </Block>
        </Block>
      );
    }

    return this.props.children;
  }
}

