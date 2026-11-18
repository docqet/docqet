import Box from "@mui/material/Box";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";

/* The handle what can be dragged is picked up by, faint until the row or card is hovered. */
export function Grip() {
  return (
    <Box
      className="grip"
      aria-hidden
      sx={{
        display: "flex",
        flex: "none",
        color: "text.disabled",
        cursor: "grab",
        transition: "color 120ms",
      }}
    >
      <DragIndicatorRoundedIcon sx={{ fontSize: 18 }} />
    </Box>
  );
}
