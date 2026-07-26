import { TYPE_SCALE, TYPE_COLOR } from "../../config/typography";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

const TAGS = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  eyebrow: "p",
  bodyLg: "p",
  body: "p",
  small: "p",
  micro: "span",
  stat: "p",
};

export function Heading({ as, variant = "h2", color = "primary", className = "", children, ...rest }) {
  const Tag = as || TAGS[variant] || "h2";
  return (
    <Tag className={cx(TYPE_SCALE[variant], TYPE_COLOR[color], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Text({ as, variant = "body", color = "soft", className = "", children, ...rest }) {
  const Tag = as || TAGS[variant] || "p";
  return (
    <Tag className={cx(TYPE_SCALE[variant], TYPE_COLOR[color], className)} {...rest}>
      {children}
    </Tag>
  );
}
