"use client";

import createGlobe, { type Arc, type Globe, type Marker } from "cobe";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { journey } from "./data";

type GlobeProps = {
  activeIndex: number;
};

const TAU = Math.PI * 2;
const initialGlobeScale = 1.22;
const markerElevation = 0.045;

type Flight = {
  id: string;
  left: number;
  top: number;
  angle: number;
  opacity: number;
  active: boolean;
};

function lngToPhi(lng: number) {
  return ((90 - lng) * Math.PI) / 180 + Math.PI;
}

function latToTheta(lat: number) {
  return (lat * Math.PI) / 180;
}

function shortestAngle(from: number, to: number) {
  let diff = (to - from) % TAU;
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return from + diff;
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function toVector(lat: number, lng: number) {
  const latitude = (lat * Math.PI) / 180;
  const longitude = (lng * Math.PI) / 180 - Math.PI;
  const radius = Math.cos(latitude);
  return [-radius * Math.cos(longitude), Math.sin(latitude), radius * Math.sin(longitude)] as const;
}

function projectLocation(lat: number, lng: number, phi: number, theta: number, scale: number) {
  const [x, y, z] = toVector(lat, lng);
  const cosTheta = Math.cos(theta);
  const cosPhi = Math.cos(phi);
  const sinTheta = Math.sin(theta);
  const sinPhi = Math.sin(phi);
  const projectedX = cosPhi * x + sinPhi * z;
  const projectedY = sinPhi * sinTheta * x + cosTheta * y - cosPhi * sinTheta * z;
  const facing = -sinPhi * cosTheta * x + sinTheta * y + cosPhi * cosTheta * z;

  return {
    x: ((projectedX * scale) + 1) / 2,
    y: ((-projectedY * scale) + 1) / 2,
    visible: facing >= -0.08,
  };
}

export function JourneyGlobe({ activeIndex }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeRef = useRef<Globe | null>(null);
  const phiRef = useRef(lngToPhi(journey[0].lng));
  const thetaRef = useRef(latToTheta(journey[0].lat));
  const targetPhiRef = useRef(phiRef.current);
  const targetThetaRef = useRef(thetaRef.current);
  const motionFrameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, phi: phiRef.current, theta: thetaRef.current });
  const sizeRef = useRef(520);
  const scaleRef = useRef(initialGlobeScale);
  const [flights, setFlights] = useState<Flight[]>([]);

  const markers = useMemo<Marker[]>(
    () =>
      journey.map((stop, index) => ({
        location: [stop.lat, stop.lng],
        size: index === activeIndex ? 0.075 : index < activeIndex ? 0.052 : 0.038,
        color: index <= activeIndex ? [0.05, 0.78, 0.86] : [0.1, 0.32, 0.75],
        id: stop.place,
      })),
    [activeIndex],
  );

  const activeSegmentIndex = Math.min(activeIndex, journey.length - 2);

  const arcs = useMemo<Arc[]>(
    () =>
      journey.slice(1, activeSegmentIndex + 2).map((stop, index) => ({
        from: [journey[index].lat, journey[index].lng],
        to: [stop.lat, stop.lng],
        color: index === activeSegmentIndex ? [0.05, 0.78, 0.86] : [0.02, 0.42, 0.58],
        id: `${journey[index].place}-${stop.place}`,
      })),
    [activeSegmentIndex],
  );

  const updateFlights = useCallback(() => {
    const from = journey[activeSegmentIndex];
    const to = journey[activeSegmentIndex + 1];
    const start = projectLocation(from.lat, from.lng, phiRef.current, thetaRef.current, scaleRef.current);
    const end = projectLocation(to.lat, to.lng, phiRef.current, thetaRef.current, scaleRef.current);
    const left = (start.x * 0.34 + end.x * 0.66) * 100;
    const top = (start.y * 0.34 + end.y * 0.66) * 100;
    const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;

    setFlights([
      {
        id: `${from.place}-${to.place}`,
        left,
        top,
        angle,
        opacity: start.visible || end.visible ? 1 : 0.18,
        active: true,
      },
    ]);
  }, [activeSegmentIndex]);

  const scheduleMotion = useCallback(() => {
    if (motionFrameRef.current !== null) return;

    const tick = () => {
      const globe = globeRef.current;
      if (!globe) {
        motionFrameRef.current = null;
        return;
      }

      const nextPhi = lerp(phiRef.current, targetPhiRef.current, 0.12);
      const nextTheta = lerp(thetaRef.current, targetThetaRef.current, 0.12);
      const remaining = Math.abs(targetPhiRef.current - nextPhi) + Math.abs(targetThetaRef.current - nextTheta);

      phiRef.current = remaining < 0.001 ? targetPhiRef.current : nextPhi;
      thetaRef.current = remaining < 0.001 ? targetThetaRef.current : nextTheta;

      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        width: sizeRef.current * 2,
        height: sizeRef.current * 2,
        scale: scaleRef.current,
      });
      updateFlights();

      if (remaining < 0.001) {
        motionFrameRef.current = null;
        return;
      }

      motionFrameRef.current = requestAnimationFrame(tick);
    };

    motionFrameRef.current = requestAnimationFrame(tick);
  }, [updateFlights]);

  useEffect(() => {
    const activeStop = journey[activeIndex];
    targetPhiRef.current = shortestAngle(phiRef.current, lngToPhi(activeStop.lng));
    targetThetaRef.current = latToTheta(activeStop.lat);
    globeRef.current?.update({ markers, arcs });
    updateFlights();
    scheduleMotion();
  }, [activeIndex, arcs, markers, scheduleMotion, updateFlights]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let frame = 0;

    const resize = () => {
      const parentWidth = canvas.parentElement?.clientWidth ?? 520;
      const width = Math.max(280, Math.min(parentWidth, 560));
      sizeRef.current = width;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${width}px`;
    };

    resize();

    const globe = createGlobe(canvas, {
      width: sizeRef.current * 2,
      height: sizeRef.current * 2,
      devicePixelRatio: 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.12,
      mapSamples: 30000,
      mapBrightness: 8,
      mapBaseBrightness: 0.08,
      baseColor: [0.01, 0.035, 0.26],
      markerColor: [0.05, 0.78, 0.86],
      glowColor: [0.85, 0.9, 1],
      markers,
      arcs,
      arcColor: [0.05, 0.78, 0.86],
      arcWidth: 0.42,
      arcHeight: 0.2,
      markerElevation,
      scale: scaleRef.current,
      offset: [0, 0],
      opacity: 1,
    });

    globeRef.current = globe;

    const updateCamera = () => {
      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        width: sizeRef.current * 2,
        height: sizeRef.current * 2,
        scale: scaleRef.current,
      });
      updateFlights();
    };

    const stopMotion = () => {
      if (motionFrameRef.current === null) return;
      cancelAnimationFrame(motionFrameRef.current);
      motionFrameRef.current = null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      draggingRef.current = true;
      stopMotion();
      canvas.setPointerCapture(event.pointerId);
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        phi: phiRef.current,
        theta: thetaRef.current,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const drag = dragStartRef.current;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      phiRef.current = drag.phi + deltaX * 0.006;
      thetaRef.current = Math.max(-1.15, Math.min(1.15, drag.theta - deltaY * 0.006));
      targetPhiRef.current = phiRef.current;
      targetThetaRef.current = thetaRef.current;
      updateCamera();
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      stopMotion();
      const nextScale = scaleRef.current + (event.deltaY > 0 ? 0.08 : -0.08);
      scaleRef.current = Math.max(0.9, Math.min(1.85, nextScale));
      updateCamera();
    };

    const handlePointerUp = (event: PointerEvent) => {
      draggingRef.current = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    const observer = new ResizeObserver(() => {
      resize();
      globe.update({
        width: sizeRef.current * 2,
        height: sizeRef.current * 2,
        phi: phiRef.current,
        theta: thetaRef.current,
        scale: scaleRef.current,
      });
      updateFlights();
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    frame = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
      updateFlights();
    });

    return () => {
      cancelAnimationFrame(frame);
      if (motionFrameRef.current !== null) cancelAnimationFrame(motionFrameRef.current);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      globe.destroy();
      globeRef.current = null;
    };
  }, [arcs, markers, updateFlights]);

  return (
    <div className="github-globe" aria-label="Interactive career route globe">
      <canvas ref={canvasRef} />
      <div className="flight-layer" aria-hidden="true">
        {flights.map((flight) => (
          <span
            className={`flight-plane ${flight.active ? "on" : ""}`}
            key={flight.id}
            style={
              {
                "--x": `${flight.left}%`,
                "--y": `${flight.top}%`,
                "--r": `${flight.angle}deg`,
                "--o": flight.opacity,
                "--d": "0ms",
              } as CSSProperties
            }
          >
            ✈
          </span>
        ))}
      </div>
    </div>
  );
}
