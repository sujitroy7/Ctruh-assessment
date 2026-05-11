import Button from "@/components/ui/Button";
import { XCircle } from "lucide-react";
import React from "react";

interface Props {
  status: "cancelled" | "pending" | "confirmed" | "shipped" | "delivered";
}
export default function OrderActions({ status }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {status !== "cancelled" ? (
        <>
          <Button variant="primary" size="sm">
            Track package
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            // onClick={() => onCancel(order.id)}
          >
            Cancel order
          </Button>
        </>
      ) : null}
    </div>
  );
}
