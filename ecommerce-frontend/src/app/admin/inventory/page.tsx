"use client";

import { useEffect, useState } from "react";
import {
  InventoryItem,
  InventorySummary,
  AdjustStockPayload,
  InventoryLog,
} from "@/app/types/inventory";
import {
  getInventorySummaryApi,
  getInventoryListApi,
  adjustStockApi,
  getProductLogsApi,
} from "@/app/libs/inventoryApi";

export default function AdminInventoryPage() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // 📦 Quick Adjust Modal States
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<"Restock" | "Damaged" | "Adjustment">("Restock");
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustNote, setAdjustNote] = useState<string>("");
  const [adjusting, setAdjusting] = useState<boolean>(false);

  // 📜 History / Audit Logs Modal States
  const [logProduct, setLogProduct] = useState<InventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumData, listData] = await Promise.all([
        getInventorySummaryApi(),
        getInventoryListApi(filter, search),
      ]);
      setSummary(sumData);
      setItems(listData);
    } catch (err: any) {
      showToast(err.message || "Failed to load inventory data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenAdjust = (item: InventoryItem, defaultAction: "Restock" | "Damaged" | "Adjustment" = "Restock") => {
    setSelectedProduct(item);
    setAdjustAction(defaultAction);
    setAdjustQty(defaultAction === "Restock" ? 10 : 1);
    setAdjustNote("");
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const finalQty = adjustAction === "Damaged" ? -Math.abs(adjustQty) : adjustQty;
    if (finalQty === 0) {
      showToast("Quantity cannot be 0", "error");
      return;
    }

    try {
      setAdjusting(true);
      const payload: AdjustStockPayload = {
        productId: selectedProduct.ProductId || (selectedProduct as any).productId || selectedProduct.productId,
        quantity: finalQty,
        action: adjustAction,
        note: adjustNote,
      };
      await adjustStockApi(payload);
      showToast(`Stock updated for "${selectedProduct.title || (selectedProduct as any).Title}"!`);
      setSelectedProduct(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update stock.", "error");
    } finally {
      setAdjusting(false);
    }
  };

  const handleOpenLogs = async (item: InventoryItem) => {
    const prodId = item.productId || (item as any).ProductId;
    setLogProduct(item);
    setLogsLoading(true);
    try {
      const data = await getProductLogsApi(prodId);
      setLogs(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load audit logs.", "error");
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            backgroundColor: toast.type === "success" ? "#088178" : "#dc2626",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: "700",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px 0" }}>
          Inventory Management
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
          Track warehouse stock levels, execute quick restocks, and review audit trail logs.
        </p>
      </div>

      {/* Summary Metrics Row */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#e6f7f5", color: "#088178", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              <i className="fas fa-boxes" />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>Total Products</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#1f2937" }}>{summary.totalProducts}</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              <i className="fas fa-check-circle" />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>In Stock</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#16a34a" }}>{summary.inStockProducts}</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              <i className="fas fa-exclamation-triangle" />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>Low Stock (&le; 5)</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#d97706" }}>{summary.lowStockProducts}</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              <i className="fas fa-times-circle" />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>Out of Stock</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#dc2626" }}>{summary.outOfStockProducts}</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
              <i className="fas fa-warehouse" />
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>Total Units</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#7c3aed" }}>{summary.totalStockUnits.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { key: "all", label: "All Items" },
            { key: "lowstock", label: `Low Stock (${summary?.lowStockProducts ?? 0})` },
            { key: "outofstock", label: `Out of Stock (${summary?.outOfStockProducts ?? 0})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: filter === tab.key ? "#088178" : "#fff",
                color: filter === tab.key ? "#fff" : "#6b7280",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ position: "relative", minWidth: "280px" }}>
          <i className="fas fa-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "13px" }} />
          <input
            type="text"
            placeholder="Search title, brand, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 34px 9px 36px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", backgroundColor: "#fff" }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Clear search"
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "13px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Inventory Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#088178", marginBottom: "12px", display: "block" }} />
            Loading inventory items...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
            <i className="fas fa-box-open" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }} />
            No inventory items matched your filter.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  {["Product", "Category / Brand", "Price", "Stock Level", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "13px 16px", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const prodId = item.productId || (item as any).ProductId;
                  const title = item.title || (item as any).Title;
                  const price = item.price || (item as any).Price;
                  const category = item.category || (item as any).Category;
                  const brand = item.brand || (item as any).Brand;
                  const stock = item.stockQuantity ?? (item as any).StockQuantity ?? 0;
                  const img = item.imageUrl || (item as any).ImageUrl || "/img/products/f1.jpg";

                  const isOut = stock <= 0;
                  const isLow = stock > 0 && stock <= 5;

                  const statusBg = isOut ? "#fee2e2" : isLow ? "#fef3c7" : "#dcfce7";
                  const statusColor = isOut ? "#dc2626" : isLow ? "#d97706" : "#16a34a";
                  const statusLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";

                  return (
                    <tr key={prodId} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.15s" }}>
                      {/* Product */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={img} alt={title} style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", backgroundColor: "#f3f4f6" }} />
                          <div>
                            <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "13px" }}>{title}</div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>ID: #{prodId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category / Brand */}
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>
                        <div>{category}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{brand}</div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1f2937", fontSize: "13px" }}>
                        ${price.toLocaleString()}
                      </td>

                      {/* Stock Level */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "15px", fontWeight: "800", color: isOut ? "#dc2626" : isLow ? "#d97706" : "#111827" }}>
                            {stock}
                          </span>
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>units</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ backgroundColor: statusBg, color: statusColor, padding: "4px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <i className={`fas ${isOut ? "fa-times-circle" : isLow ? "fa-exclamation-triangle" : "fa-check-circle"}`} />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenAdjust(item, "Restock")}
                            style={{
                              backgroundColor: "#088178",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <i className="fas fa-plus" /> Restock
                          </button>

                          <button
                            onClick={() => handleOpenAdjust(item, "Adjustment")}
                            style={{
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                              border: "1px solid #e5e7eb",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                            title="Adjust / Damage"
                          >
                            <i className="fas fa-sliders-h" />
                          </button>

                          <button
                            onClick={() => handleOpenLogs(item)}
                            style={{
                              backgroundColor: "#f3f4f6",
                              color: "#4b5563",
                              border: "1px solid #e5e7eb",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                            title="View Audit Logs"
                          >
                            <i className="fas fa-history" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── QUICK RESTOCK / ADJUST MODAL ─── */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1f2937" }}>
                Update Stock
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ background: "none", border: "none", fontSize: "18px", color: "#9ca3af", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>
              Product: <strong>{selectedProduct.title || (selectedProduct as any).Title}</strong> (Current Stock:{" "}
              <strong>{selectedProduct.stockQuantity ?? (selectedProduct as any).StockQuantity ?? 0} units</strong>)
            </p>

            <form onSubmit={handleAdjustSubmit}>
              {/* Action Type */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Action Type
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                >
                  <option value="Restock">Restock (+ Add new inventory)</option>
                  <option value="Adjustment">Adjustment (+/- Correction)</option>
                  <option value="Damaged">Damaged / Expired (- Remove stock)</option>
                </select>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "700" }}
                />
              </div>

              {/* Note / Reason */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received from Supplier shipment #84"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#374151", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#088178", color: "#fff", fontWeight: "700", cursor: "pointer" }}
                >
                  {adjusting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── AUDIT TRAIL LOGS MODAL ─── */}
      {logProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1f2937" }}>
                  Stock Movement History
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                  {logProduct.title || (logProduct as any).Title}
                </p>
              </div>
              <button
                onClick={() => setLogProduct(null)}
                style={{ background: "none", border: "none", fontSize: "18px", color: "#9ca3af", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {logsLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "22px", color: "#088178", marginBottom: "8px", display: "block" }} />
                Loading audit trail...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                No movement history recorded yet for this product.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {logs.map((log) => {
                  const date = new Date(log.createdAt).toLocaleString("en-PK", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isPositive = log.quantityChanged > 0;
                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "10px",
                        border: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              backgroundColor: isPositive ? "#dcfce7" : "#fee2e2",
                              color: isPositive ? "#16a34a" : "#dc2626",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            {log.action}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937" }}>
                            {isPositive ? `+${log.quantityChanged}` : log.quantityChanged} units
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                          {log.note || "No note"} &middot; {date}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: "#111827" }}>
                          {log.previousStock} &rarr; {log.newStock}
                        </div>
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>Stock Level</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
