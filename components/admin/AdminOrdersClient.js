"use client";

import { useState } from "react";
import OrderProvider, { useOrder } from "@/components/OrderProvider";
import OrderModal from "@/components/OrderModal";
import OrderList from "@/components/admin/OrderList";

function AddOrderButton() {
  const { openModal } = useOrder();
  return (
    <button
      type="button"
      onClick={openModal}
      className="btn w-full sm:w-auto"
    >
      অর্ডার যোগ করুন
    </button>
  );
}

export default function AdminOrdersClient({ search, status }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
        <OrderProvider>
          <AddOrderButton />
          <OrderModal onSuccess={() => setRefreshKey((k) => k + 1)} />
        </OrderProvider>
      </div>
      <OrderList search={search} status={status} refreshKey={refreshKey} />
    </div>
  );
}
