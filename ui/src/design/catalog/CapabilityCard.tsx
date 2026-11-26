import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import type { ReactNode } from "react";
import { CapabilityLabel } from "./CapabilityLabel";
import type { StabilityLevelId } from "../stability/stability";

export type CapabilityCardProps = {
  /** What it lets someone do: "Sign for a delivery". */
  name: string;
  /** Its stability, or null for a draft nobody has started on. */
  level: StabilityLevelId | null;
  /** Show the drag grip, where the app lets it be dragged, such as onto a Feature. */
  grip?: boolean;
  /** At the end of its line, after its stability: the app's menu for it. */
  actions?: ReactNode;
  /** Makes the card a button, such as to open the Capability. */
  onClick?: () => void;
  /** What its name opens on hover (see CapabilityLabel). */
  details?: ReactNode;
  /** Something small after its name (see CapabilityLabel). */
  hint?: ReactNode;
};

/*
 * A Capability on its own, in no Feature: its bolt, its name, and its
 * stability as a short mark, or "Draft". One line, cut short, so a few sit
 * in a narrow column. Editing and dragging are the app's: `grip` is the
 * handle it's picked up by, and `actions` holds its menu.
 */
export function CapabilityCard({ name, level, grip = false, actions, onClick, details, hint }: CapabilityCardProps) {
  const line = <CapabilityLabel name={name} level={level} grip={grip} actions={actions} details={details} hint={hint} />;
  return (
    <Card
      component="article"
      aria-label={name}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        "&:hover .grip": { color: "text.secondary" },
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ px: 2, py: 1.25 }}>
          {line}
        </CardActionArea>
      ) : (
        <Box sx={{ px: 2, py: 1.25 }}>{line}</Box>
      )}
    </Card>
  );
}
