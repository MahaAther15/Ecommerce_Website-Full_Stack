"use client";

import { useState, useEffect } from "react";
import CartHero from "../Components/cart/CartHero";
import CartTable from "../Components/cart/CartTable";
import CouponSection from "../Components/cart/CouponSection";
import CartSummary from "../Components/cart/CartSummary";
import { CartItemType } from "../types/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    setIsLoaded(true);
  }, []);

  const saveCart = (newCart: CartItemType[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    saveCart(updatedCart);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity > 0) {
      const updatedCart = [...cart];
      updatedCart[index] = { ...updatedCart[index], quantity };
      saveCart(updatedCart);
    }
  };

  return (
    <div>
      <CartHero />
      <CartTable
        cart={isLoaded ? cart : []}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
      <section id="cart-add" className="section-p1">
        <CouponSection />
        <CartSummary cart={isLoaded ? cart : []} />
      </section>
    </div>
  );
}
