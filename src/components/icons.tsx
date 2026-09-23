import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MoleculeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="7.5" r="2.2" />
      <circle cx="17" cy="7.5" r="2.2" />
      <circle cx="12" cy="17" r="2.2" />
      <path d="M8.9 8.8L11 15M15.1 8.8L13 15M9.2 7.5H14.8" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3c.7 4 2.3 5.6 6 6-3.7.4-5.3 2-6 6-.7-4-2.3-5.6-6-6 3.7-.4 5.3-2 6-6z" />
      <path d="M18.5 15c.2 1.3.8 1.9 2 2.1-1.2.2-1.8.8-2 2.1-.2-1.3-.8-1.9-2-2.1 1.2-.2 1.8-.8 2-2.1z" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7.1-4.4-9.5-8.6C1 8.2 2.5 5 6 5c2 0 3.5 1.2 6 3.6C14.5 6.2 16 5 18 5c3.5 0 5 3.2 3.5 6.4C19.1 15.6 12 20 12 20z" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3.1v5.3c0 4.8-3 8.9-7 10.1-4-1.2-7-5.3-7-10.1V6.1L12 3z" />
    </svg>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.3c3.8 4.7 6.5 8.3 6.5 11.6a6.5 6.5 0 1 1-13 0c0-3.3 2.7-6.9 6.5-11.6z" />
    </svg>
  );
}

export function LeafDuoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 13.2c0-5.1 4-9.4 12.6-9.4.1 8.2-4 12.6-9.1 12.6-2 0-3.5-1.5-3.5-3.2z" />
      <path d="M6 13.7c2.3 0 4.4 1.1 5.6 3" />
    </svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.3 3h5.4M10.2 3v5.9l-5 8.5a1.9 1.9 0 0 0 1.6 2.9h10.4a1.9 1.9 0 0 0 1.6-2.9l-5-8.5V3" />
      <path d="M7.8 14.5h8.4" />
    </svg>
  );
}

export function DiamondIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.3 9.2L9 4.3h6l2.7 4.9L12 19.5 6.3 9.2z" />
      <path d="M6.3 9.2h11.4M9.8 9.2L12 19.5M14.2 9.2L12 19.5" />
    </svg>
  );
}

export function HourglassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3h11M6.5 21h11" />
      <path d="M7.5 3c0 5 2.8 6.2 4.5 7-1.7.8-4.5 2-4.5 7M16.5 3c0 5-2.8 6.2-4.5 7 1.7.8 4.5 2 4.5 7" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.6 6.8L12 17.8l-6.2 3.3 1.6-6.8-5.2-4.7 6.9-.7L12 2.5z" />
    </svg>
  );
}

export function HandHeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13.5c1.4-1 3-1.4 4.6-1.4 3.2 0 5.3 2 8.4 2 1.2 0 2.2-.3 3-.7" />
      <path d="M4 13.5V19M4 19c2.6.9 5.6 1.7 8 1.7 2.7 0 5.6-1 8-2.2v-4.2" />
      <path d="M12 8.6c-.5-1-1.4-1.7-2.4-1.7-1.4 0-2.4 1.1-2.4 2.4 0 1.9 2.3 3 4.8 4.6 2.5-1.6 4.8-2.7 4.8-4.6 0-1.3-1-2.4-2.4-2.4-1 0-1.9.7-2.4 1.7z" />
    </svg>
  );
}
