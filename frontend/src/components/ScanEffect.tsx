export function ScanEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan-lines"
        style={{
          mixBlendMode: "screen",
          animation: "scan-lines 8s linear infinite",
        }}
      />
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-transparent to-black/20 pointer-events-none" />
    </div>
  );
}
