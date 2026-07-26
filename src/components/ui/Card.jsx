function cx(...args) {
  return args.filter(Boolean).join(" ");
}


export function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={cx(
        "rounded-xl  border-line bg-paper shadow-sm shadow-ink/[0.04] transition-shadow duration-200 hover:shadow-md hover:shadow-ink/[0.07]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...rest }) {
  return (
    <div className={cx("flex items-center justify-between px-5 py-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...rest }) {
  return (
    <div className={cx("p-5", className)} {...rest}>
      {children}
    </div>
  );
}