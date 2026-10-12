export function Chevron({
  direction = "right",
}: {
  direction?: "left" | "right";
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d={direction === "left" ? "M15 4L7 12l8 8" : "M9 4l8 8-8 8"} />
    </svg>
  );
}
