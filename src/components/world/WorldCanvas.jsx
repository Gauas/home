import { useEffect, useRef, useState } from "react";
import { getQualityProfile } from "../../lib/world/QualityManager";

export function WorldCanvas({ controllerRef, onReady }) {
  const canvasRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    let world;
    let cancelled = false;
    import("../../lib/world/WorldController").then(({ WorldController }) => {
      if (cancelled || !canvasRef.current) return;
      try {
        world = new WorldController(canvasRef.current, getQualityProfile());
        controllerRef.current = world;
        onReady?.(world);
      } catch (error) {
        console.error("GAUAS world could not initialize", error);
        setFallback(true);
        document.documentElement.classList.add("world-fallback");
      }
    }).catch((error) => {
      console.error("GAUAS world module could not load", error);
      setFallback(true);
      document.documentElement.classList.add("world-fallback");
    });
    return () => {
      cancelled = true;
      world?.dispose();
      document.documentElement.classList.remove("world-fallback");
      if (controllerRef.current === world) controllerRef.current = null;
    };
  }, [controllerRef, onReady]);

  return (
    <div className={`world-canvas ${fallback ? "is-fallback" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="world-canvas__fallback" />
    </div>
  );
}
