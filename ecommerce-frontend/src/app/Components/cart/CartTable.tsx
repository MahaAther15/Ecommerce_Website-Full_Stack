import Link from "next/link";
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
      {cart.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #eef2f5",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "rgba(8, 129, 120, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "6px",
            }}
          >
            <i className="fal fa-shopping-cart" style={{ fontSize: "32px", color: "#088178" }}></i>
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
            Your Cart is Empty
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 10px 0", maxWidth: "380px" }}>
            Looks like you haven't added any items to your shopping cart yet.
          </p>
          <Link
            href="/shop"
            id="browse-products"
            style={{
              backgroundColor: "#088178",
              color: "#ffffff",
              padding: "12px 30px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(8, 129, 120, 0.25)",
              transition: "0.3s ease",
            }}
          >
            <i className="fas fa-shopping-bag"></i> Browse Products
          </Link>
        </div>
      ) : (
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
            {cart.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                index={index}
                onRemove={onRemove}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
