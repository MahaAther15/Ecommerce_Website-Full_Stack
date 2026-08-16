import { CartItemType } from "@/app/types/cart";
import CartItem from "./CartItem";

interface CartTableProps {
  cart: CartItemType[];
  onRemove: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export default function CartTable({
  cart,
  onRemove,
  onUpdateQuantity,
}: CartTableProps) {
  return (
    <section id="cart" className="section-p1">
      <table width="100%">
        <thead>
          <tr>
            <td>REMOVE</td>
            <td>IMAGE</td>
            <td>PRODUCT</td>
            <td>PRICE</td>
            <td>QUANTITY</td>
            <td>SUBTOTAL</td>
          </tr>
        </thead>
        <tbody>
          {cart.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                Your cart is empty
              </td>
            </tr>
          ) : (
            cart.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                index={index}
                onRemove={onRemove}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
