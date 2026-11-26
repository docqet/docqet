import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/* The shell's frame, in skeletons, while the product is first read: the top bar, the side nav and an overview's header and figures. */
export function ShellSkeleton() {
  return (
    <Box
      aria-busy="true"
      aria-label="Loading"
      sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gridTemplateRows: "56px 1fr", height: "100vh" }}
    >
      <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 2, px: 2, borderBottom: 1, borderColor: "divider" }}>
        <Skeleton variant="rounded" width={110} height={28} />
        <Skeleton width={160} />
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="rounded" sx={{ width: { xs: 120, sm: 240 } }} height={36} />
      </Box>
      <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1, p: 1.5, borderRight: 1, borderColor: "divider" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={28} />
        ))}
      </Box>
      <Box sx={{ p: { xs: 2, md: 4 }, minWidth: 0 }}>
        <Skeleton width={80} />
        <Skeleton sx={{ width: { xs: "60%", sm: 220 } }} height={44} />
        <Skeleton sx={{ width: { xs: "90%", sm: 320 } }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 1.5, mt: 3 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={120} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
