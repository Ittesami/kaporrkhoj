import { COLOR_FAMILIES } from "@/lib/taxonomy";

const BY_VALUE = Object.fromEntries(COLOR_FAMILIES.map((c) => [c.value, c]));

export function swatchStyle(c) {
  return c.hex.startsWith("linear") ? { backgroundImage: c.hex } : { backgroundColor: c.hex };
}

export default function ColorDots({ colors = [], size = "h-3.5 w-3.5" }) {
  const list = colors.map((c) => BY_VALUE[c]).filter(Boolean).slice(0, 5);
  if (!list.length) return <span />;
  return (
    <span className="flex -space-x-1">
      {list.map((c) => (
        <span
          key={c.value}
          title={c.label}
          className={`${size} rounded-full border border-black/15 ring-2 ring-white`}
          style={swatchStyle(c)}
        />
      ))}
    </span>
  );
}
