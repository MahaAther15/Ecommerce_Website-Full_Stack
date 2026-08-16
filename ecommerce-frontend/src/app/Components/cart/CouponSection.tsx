"use client";

import { useState } from "react";

export default function CouponSection() {
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }
    alert(`Coupon "${couponCode}" applied successfully!`);
    setCouponCode("");
  };

  return (
    <div id="coupon">
      <h3>Apply Coupon</h3>
      <div>
        <input
          type="text"
          placeholder="Enter Your Coupon"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button className="normal" onClick={handleApplyCoupon}>
          Apply
        </button>
      </div>
    </div>
  );
}
