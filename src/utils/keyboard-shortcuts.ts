import { Mode } from "@/types/enums";

export const MODE_SHORTCUTS: Record<Mode, string> = {
  [Mode.Select]: "1",
  [Mode.Pan]: "2",
  [Mode.Draw]: "3",
  [Mode.DrawCircle]: "4",
  [Mode.DrawArrow]: "5",
  [Mode.DrawLine]: "6",
  [Mode.DrawPen]: "7",
};

export function getModeShortcut(mode: Mode): string {
  return MODE_SHORTCUTS[mode] || "";
}
