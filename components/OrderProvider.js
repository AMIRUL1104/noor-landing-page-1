"use client";
import { createContext, useContext, useMemo, useState } from "react";

const Ctx = createContext(null);

/** Shares the selected hoodie colour (gallery <-> order form) and the modal open state. */
export default function OrderProvider({ children }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(
    () => ({ colorIdx, setColorIdx, isOpen, openModal: () => setOpen(true), closeModal: () => setOpen(false) }),
    [colorIdx, isOpen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useOrder = () => useContext(Ctx);
