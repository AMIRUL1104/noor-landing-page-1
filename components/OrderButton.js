"use client";
import { useOrder } from "./OrderProvider";
import Bi from "./Bi";

export default function OrderButton({ className = "" }) {
  const { openModal } = useOrder();
  return (
    <button type="button" onClick={openModal} className={`btn ${className}`}>
      <Bi k="order" />
    </button>
  );
}
