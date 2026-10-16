// A short message box. "error" is red, "notice" is neutral, "success" is green.
const styles = {
  error: "border-danger/30 bg-danger-soft text-danger",
  notice: "border-line bg-surface text-ink",
  success: "border-success/30 bg-success/10 text-success",
};

export default function Alert({ type = "error", className = "", children }) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${styles[type]} ${className}`}
    >
      {children}
    </div>
  );
}