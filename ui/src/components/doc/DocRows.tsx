import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { Excerpt } from "../markdown/Markdown";

/* Rows that each open a doc's page: its icon, name and description, lit in the accent's soft fill on hover. */
export function DocRows({ rows }: { rows: { key: string; href: string; icon: ReactNode; name: string; summary?: string; mark?: ReactNode }[] }) {
  return (
    <ul>
      {rows.map((r) => (
        <li key={r.key}>
          <Box
            component="a"
            href={r.href}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "calc(100% + 16px)",
              mx: -1,
              px: 1,
              py: 0.75,
              color: "inherit",
              textDecoration: "none",
              borderRadius: "5px",
              "&:hover": { bgcolor: "surface.accentSoft" },
            }}
          >
            <Box component="span" sx={{ display: "inline-flex", alignSelf: "flex-start", mt: "2px" }}>
              {r.icon}
            </Box>
            <Box component="span" sx={{ display: "grid", flex: 1, minWidth: 0 }}>
              <Box component="span" sx={{ minWidth: 0, fontWeight: 550 }}>
                {r.name}
              </Box>
              {r.summary ? (
                <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
                  <Excerpt text={r.summary} lines={2} />
                </Box>
              ) : null}
            </Box>
            {r.mark}
          </Box>
        </li>
      ))}
    </ul>
  );
}
