import Box from "@mui/material/Box";
import { withParam } from "../routes";

/*
 * A choice kept in the address, as a row of links: what it is, then each
 * option, with how many it holds where that's known. The first option is the
 * default, which leaves the param out. The one chosen is lit in the accent.
 */
export function Choice({
  label,
  param: key,
  value,
  options,
}: {
  label: string;
  param: string;
  value: string;
  options: ([string, string] | [string, string, number])[];
}) {
  return (
    <Box role="group" aria-label={label} sx={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 0.5 }}>
      <Box component="span" sx={{ mr: 0.5, typography: "overline", color: "text.disabled" }}>
        {label}
      </Box>
      {options.map(([v, name, n], i) => (
        <Box
          component="a"
          key={v}
          href={withParam(key, i === 0 ? null : v)}
          aria-current={v === value ? "true" : undefined}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: "9px",
            py: "3px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "text.secondary",
            textDecoration: "none",
            border: 1,
            borderColor: "surface.borderStrong",
            borderRadius: "6px",
            "&:hover": { color: "text.primary", borderColor: "text.disabled" },
            "&[aria-current]": {
              color: "primary.main",
              bgcolor: "surface.accentSoft",
              borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 45%, transparent)`,
            },
            "&[aria-current] > span": { color: "inherit" },
          }}
        >
          {name}
          {n !== undefined ? (
            <Box component="span" sx={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: "text.disabled" }}>
              {n}
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}
