import { Component, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { sectionHref } from "../routes";

/*
 * Around each page, so one that crashes says so, with a way to reload or go
 * to the overview, while the shell around it keeps working. Keyed by the
 * page and tab where it's used, so going to another starts afresh.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("A page couldn't be shown", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 640 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        >
          <AlertTitle>This page couldn&rsquo;t be shown</AlertTitle>
          Something went wrong while drawing it. Reload to try again, or <a href={sectionHref("overview")}>go to the overview</a>.
        </Alert>
      </Box>
    );
  }
}
