// ecommerce-frontend/src/app/Components/cart/CartSummary.tsx
"use client";

import { useRouter } from "next/navigation";
import { CartItemType } from "@/app/types/cart";
import { useAppSelector } from "@/app/redux/hooks";

interface CartSummaryProps {
  cart: CartItemType[];
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    // 1. Check if user is logged in
    if (!isAuthenticated) {
      alert("Please login first to proceed to checkout!");
      router.push("/login");
      return;
    }

    // 2. Check if cart has items
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // 3. Navigate directly to Payment page
    router.push("/payment");
  };

  return (
    <div id="subtotal">
      <h3>Cart Total</h3>
      <table>
        <tbody>
          <tr>
            <td>Cart Subtotal</td>
            <td>$ {subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shipping</td>
            <td>Free</td>
          </tr>
          <tr>
            <td>
              <strong>Total</strong>
            </td>
            <td>
              <strong>$ {subtotal.toFixed(2)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <button className="normal" onClick={handleCheckout}>
        Proceed to checkout
      </button>
    </div>
  );
}
