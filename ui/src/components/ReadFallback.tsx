import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useState, type ReactNode } from "react";
import type { Read } from "../model";

/* Whether `active` has held for `ms`, so a fast answer shows straight away rather than after a flash of loading. */
export function useDelayed(active: boolean, ms = 200): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setShown(true), ms);
    return () => {
      clearTimeout(timer);
      setShown(false);
    };
  }, [active, ms]);
  return active && shown;
}

/*
 * What couldn't load, with a way to try again. `inline` fits it into a line
 * of text, a table cell or a card. Its retry doesn't reach what it's in, such
 * as a fold it's in the heading of, or the map's canvas.
 */
export function ReadError({ what, onRetry, inline = false }: { what: string; onRetry: () => void; inline?: boolean }) {
  return (
    <Alert
      severity="error"
      variant={inline ? "outlined" : "standard"}
      data-no-pan
      action={
        <Button
          color="inherit"
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRetry();
          }}
        >
          Retry
        </Button>
      }
      sx={
        inline
          ? {
              display: "inline-flex",
              alignItems: "center",
              py: 0,
              px: 1,
              fontSize: 12,
              "& .MuiAlert-icon": { py: 0.5, mr: 0.75, fontSize: 16 },
              "& .MuiAlert-message": { py: 0.5 },
              "& .MuiAlert-action": { py: 0, ml: 1, mr: 0 },
            }
          : undefined
      }
    >
      Couldn&rsquo;t load {what}.
    </Alert>
  );
}

/*
 * What a part of a page shows while its read isn't in: once loading has taken
 * more than a moment, `skeleton`, sized like what it stands in for, and the
 * same space, empty, before that, so nothing shifts; or, if the read failed,
 * what couldn't load, with a retry.
 */
export function ReadFallback<T>({ read, what, skeleton, inline = false }: { read: Read<T>; what: string; skeleton: ReactNode; inline?: boolean }) {
  const slow = useDelayed(read.loading);
  if (read.error) return <ReadError what={what} onRetry={read.retry} inline={inline} />;
  return (
    <Box component="span" aria-busy="true" sx={{ display: inline ? "inline-block" : "block", visibility: slow ? "visible" : "hidden" }}>
      {skeleton}
    </Box>
  );
}
