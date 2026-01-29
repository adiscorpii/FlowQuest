export default function Toast({ type, msg }) {
  return (
    <div className={`toast ${type}`}>
      {msg}
    </div>
  );
}
