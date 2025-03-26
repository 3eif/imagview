export enum Shape {
  Rectangle = "rectangle",
  Circle = "circle",
  Line = "line",
  Arrow = "arrow",
  Path = "path",
}

export enum Mode {
  Pan = "pan",
  Draw = "draw",
  Select = "select",
  DrawCircle = "drawCircle",
  DrawLine = "drawLine",
  DrawArrow = "drawArrow",
  DrawPen = "drawPen",
}

export enum ResizeHandle {
  NW = "nw",
  N = "n",
  NE = "ne",
  E = "e",
  SE = "se",
  S = "s",
  SW = "sw",
  W = "w",
  Rotate = "rotate",
}

export enum CursorStyle {
  Default = "default",
  Grab = "grab",
  Grabbing = "grabbing",
  Crosshair = "crosshair",
  NwseResize = "nwse-resize",
  NeswResize = "nesw-resize",
  NsResize = "ns-resize",
  EwResize = "ew-resize",
}
