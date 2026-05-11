"use client";
import { getProductTypes } from "@/lib/api/products";
import React, { useEffect } from "react";

export default function AdminOrders() {
  useEffect(() => {
    getProductTypes().then((result) => console.log(result));
  }, []);

  return <div>Admin Orders: </div>;
}
