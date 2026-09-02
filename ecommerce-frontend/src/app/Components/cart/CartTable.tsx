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
        <>
          {/* Desktop Table View */}
          <div className="cart-desktop-view">
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
          </div>

          {/* Mobile Cards View (All details in front, zero horizontal scrolling) */}
          <div className="cart-mobile-view" style={{ display: "none" }}>
            {cart.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    padding: "14px",
                    display: "flex",
                    gap: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "#f8faf9",
                      border: "1px solid #e1eee5",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  {/* Details Column */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#111827",
                          lineHeight: "1.3",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.name}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#088178" }}>
                          ${item.price.toFixed(2)}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          Total: <strong style={{ color: "#111827" }}>${itemTotal.toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove Action */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {/* Stepper */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1.5px solid #d1d5db",
                          borderRadius: "8px",
                          overflow: "hidden",
                          height: "32px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                          style={{
                            width: "28px",
                            height: "100%",
                            border: "none",
                            background: "#f3f4f6",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          readOnly
                          value={item.quantity}
                          style={{
                            width: "36px",
                            height: "100%",
                            border: "none",
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#111827",
                            outline: "none",
                            padding: 0,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          style={{
                            width: "28px",
                            height: "100%",
                            border: "none",
                            background: "#f3f4f6",
                            color: "#374151",
                            fontSize: "14px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        <i className="far fa-trash-alt"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
