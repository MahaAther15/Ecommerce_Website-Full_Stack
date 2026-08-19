"use client";

import { useEffect, useState } from "react";
import CartHero from "../Components/cart/CartHero";
import CartTable from "../Components/cart/CartTable";
import CouponSection from "../Components/cart/CouponSection";
import CartSummary from "../Components/cart/CartSummary";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { removeFromCart, updateQuantity } from "../redux/slices/cartslice";

import { CartItemType } from "../types/cart";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Adapt Redux cart items to CartItemType for CartTable & CartSummary
  const cartItems: CartItemType[] = items.map((item) => ({
    id: String(item.id),
    image: item.image || "/img/products/f1.jpg",
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const handleRemoveFromCart = (index: number) => {
    const itemToRemove = items[index];
    if (itemToRemove) {
      dispatch(removeFromCart(itemToRemove.id));
    }
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const itemToUpdate = items[index];
    if (itemToUpdate) {
      dispatch(updateQuantity({ id: itemToUpdate.id, quantity }));
    }
  };

  if (!mounted) {
    return (
      <div>
        <CartHero />
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CartHero />
      <CartTable
        cart={cartItems}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
      <section id="cart-add" className="section-p1">
        <CouponSection />
        <CartSummary cart={cartItems} />
      </section>
    </div>
  );
}
