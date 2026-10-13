// A simple white box with a thin border
export default function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}