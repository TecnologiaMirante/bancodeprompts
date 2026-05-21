import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addPlatformTime } from "../firebaseClient/stats";

const INACTIVITY_MS = 60000;

export default function SessionTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const uid = user?.uid;

  const platformStart = useRef(Date.now());
  const platformLastActivity = useRef(Date.now());
  const inactivityTimer = useRef(null);

  const flush = async () => {
    if (!uid) return;
    const elapsed = Math.round(
      (platformLastActivity.current - platformStart.current) / 1000
    );
    if (elapsed > 0) {
      await addPlatformTime(uid, elapsed);
    }
    platformStart.current = Date.now();
    platformLastActivity.current = Date.now();
  };

  const resetTimer = () => {
    platformLastActivity.current = Date.now();
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(flush, INACTIVITY_MS);
  };

  useEffect(() => {
    if (!uid) return;

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else platformStart.current = Date.now();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(inactivityTimer.current);
      flush();
    };
  }, [uid]);

  return null;
}
