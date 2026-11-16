"use client";
import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((m: string) => {
    setMsg(m);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 1600);
  }, []);
  const node = <div className={`toast ${show ? "show" : ""}`}>{msg}</div>;
  return { toast, node };
}
