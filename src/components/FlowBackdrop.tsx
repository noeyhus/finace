export function FlowBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(61,122,99,0.22),transparent_68%)] blur-2xl motion-safe:animate-[drift_18s_ease-in-out_infinite]" />
      <div className="absolute -right-16 bottom-[-8%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(74,108,138,0.2),transparent_70%)] blur-2xl motion-safe:animate-[drift_22s_ease-in-out_infinite_reverse]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,35,50,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(26,35,50,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
