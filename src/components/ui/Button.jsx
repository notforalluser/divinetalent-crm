import { forwardRef } from "react";
import { BUTTON_BASE, BUTTON_VARIANTS, BUTTON_SIZES } from "../../config/buttonVariants";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

/**
 * The ONE button component used everywhere in the app.
 * Edit /src/config/buttonVariants.js to restyle every button on the site at once.
 *
 * <Button variant="primary" size="md" icon={Plus}>Add candidate</Button>
 */
const Button = forwardRef(function Button(
  { variant = "primary", size = "md", icon: Icon, iconRight: IconRight, loading, className = "", children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon />
      ) : null}
      {children}
      {!loading && IconRight ? <IconRight /> : null}
    </button>
  );
});

export default Button;
