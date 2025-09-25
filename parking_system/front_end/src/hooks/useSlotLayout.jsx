import { useCallback, useState, useEffect } from "react";
import { getSlots } from "../api";

/**
 * Hook to get and update parking slot layout and status
 */
export function useSlotLayout(svgRef) {
  const [slots, setSlots] = useState([]);

  const calculateSlots = useCallback(async () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const viewBox = svg.viewBox?.baseVal;
    if (!viewBox) return;

    // Scale SVG coordinates to actual screen size
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / viewBox.width;
    const scaleY = rect.height / viewBox.height;

    // Read positions of all elements with id like "slot-#"
    const slotElements = svg.querySelectorAll("[id^=slot-]");
    const slotPositions = Array.from(slotElements).map((el) => {
      const bbox = el.getBBox();
      return {
        id: parseInt(el.id.replace("slot-", ""), 10),
        number: el.id.replace("slot-", ""),
        x: bbox.x * scaleX,
        y: bbox.y * scaleY,
        width: bbox.width * scaleX,
        height: bbox.height * scaleY,
      };
    });

    // Merge positions with backend status data
    const backendSlots = await getSlots();
    const merged = slotPositions.map((pos) => {
      const backend = backendSlots.find((b) => b.id === pos.id);
      return {
        ...pos,
        status: backend?.status || "empty",
        car_number: backend?.car_number || "",
      };
    });

    setSlots(merged);
  }, [svgRef]);

  useEffect(() => {
    calculateSlots(); // run on mount
    window.addEventListener("resize", calculateSlots); // recalc on resize
    return () => window.removeEventListener("resize", calculateSlots);
  }, [calculateSlots]);

  return [slots, setSlots]; // current slots + updater
}
