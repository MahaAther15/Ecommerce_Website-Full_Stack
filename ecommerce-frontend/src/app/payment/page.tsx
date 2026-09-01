"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { placeOrder, clearOrderError } from "@/app/redux/slices/orderSlice";
import { clearCart } from "@/app/redux/slices/cartslice";
import { getUserAddressesApi, AddressDto } from "@/app/libs/addressApi";

import PaymentForm from "@/app/Components/Payment/PaymentForm";
import OrderSummary from "@/app/Components/Payment/OrderSummary";

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { placing, error, successMessage, selectedOrder } = useAppSelector(
    (state) => state.order
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedMethod, setSelectedMethod] = useState<string>("Cash On Delivery");
  const [savedAddresses, setSavedAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");

  // Shipping Fee Logic (Free if total >= 2000)
  const shippingFee = totalAmount >= 2000 || totalAmount === 0 ? 0 : 150;
  const finalAmount = totalAmount + shippingFee;

  const [form, setForm] = useState({
    shippingAddress: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
    phoneNumber: "",
    paymentMethod: "Cash On Delivery",
    cardNumber: "",
    cardHolderName: "",
    cardExpiry: "",
    cardCvc: "",
    walletNumber: "",
  });

  // 1. Fetch saved addresses on mount
  useEffect(() => {
    if (isAuthenticated) {
      getUserAddressesApi()
        .then((addrs) => {
          setSavedAddresses(addrs);
          // Pre-select default address if exists
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setForm((prev) => ({
              ...prev,
              shippingAddress: defaultAddr.streetAddress,
              city: defaultAddr.city,
              postalCode: defaultAddr.postalCode || "",
              country: defaultAddr.country || "Pakistan",
              phoneNumber: defaultAddr.phoneNumber,
            }));
          }
        })
        .catch((err) => console.error("Error loading addresses:", err));
    }
  }, [isAuthenticated]);

  // 2. Guard check: redirect if not logged in or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (items.length === 0 && !successMessage) {
      router.push("/cart");
    }
  }, [isAuthenticated, items, successMessage, router]);

  // 3. Redirect to Order Details page after successful order placement
  useEffect(() => {
    if (successMessage && selectedOrder) {
      dispatch(clearCart());
      const timer = setTimeout(() => {
        router.push(`/orders/${selectedOrder.id}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, selectedOrder, dispatch, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSelectSavedAddress = (addr: AddressDto | "new") => {
    if (addr === "new") {
      setSelectedAddressId("new");
    } else {
      setSelectedAddressId(addr.id);
      setForm((prev) => ({
        ...prev,
        shippingAddress: addr.streetAddress,
        city: addr.city,
        postalCode: addr.postalCode || "",
        country: addr.country || "Pakistan",
        phoneNumber: addr.phoneNumber,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.shippingAddress.trim() || !form.city.trim() || !form.phoneNumber.trim()) {
      alert("Please fill all required shipping address fields.");
      return;
    }

    // 1. Sync local cart items to backend database if backend cart is empty
    try {
      const { getCartApi, addToCartApi } = await import("@/app/libs/cartApi");
      const backendCart = await getCartApi().catch(() => null);
      const hasBackendItems = backendCart && backendCart.items && backendCart.items.length > 0;

      if (!hasBackendItems && items.length > 0) {
        for (const item of items) {
          const rawId = item.productId || item.id;
          const prodId = typeof rawId === "number" ? rawId : parseInt(String(rawId), 10);
          if (!isNaN(prodId) && prodId > 0) {
            await addToCartApi(prodId, item.quantity || 1).catch(() => null);
          }
        }
      }
    } catch (err) {
      console.warn("Cart auto-sync error:", err);
    }

    // 2. Dispatch place order action
    dispatch(
      placeOrder({
        shippingAddress: form.shippingAddress,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
        phoneNumber: form.phoneNumber,
        paymentMethod: form.paymentMethod,
      })
    );
  };

  if (!isAuthenticated || (items.length === 0 && !successMessage)) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #088178",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        ></div>
        <p style={{ color: "#6b7280", fontSize: "15px" }}>Loading Checkout...</p>
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper" style={{ backgroundColor: "#f8fafc", minHeight: "80vh", padding: "40px 0" }}>
      <div
        className="payment-page-container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Left: Checkout Form */}
        <PaymentForm
          form={form}
          savedAddresses={savedAddresses}
          selectedAddressId={selectedAddressId}
          onSelectSavedAddress={handleSelectSavedAddress}
          selectedMethod={selectedMethod}
          onInputChange={handleInputChange}
          onSelectMethod={handleSelectMethod}
          onSubmit={handleSubmit}
          placing={placing}
          finalAmount={finalAmount}
          error={error}
          onClearError={() => dispatch(clearOrderError())}
        />

        {/* Right: Order Summary */}
        <OrderSummary
          items={items}
          totalAmount={totalAmount}
          shippingFee={shippingFee}
          finalAmount={finalAmount}
        />
      </div>
    </div>
  );
}
