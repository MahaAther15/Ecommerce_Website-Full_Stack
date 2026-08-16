import { CartItemType } from "@/app/types/cart";

interface CartItemProps {
  item: CartItemType;
  index: number;
  onRemove: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export default function CartItem({
  item,
  index,
  onRemove,
  onUpdateQuantity,
}: CartItemProps) {
  const itemTotal = item.price * item.quantity;

  return (
    <tr>
      <td>
        <a
          href="#"
          className="remove-item"
          onClick={(e) => {
            e.preventDefault();
            onRemove(index);
          }}
        >
          <i className="far fa-times-circle"></i>
        </a>
      </td>
      <td>
        <img src={item.image} alt={item.name} />
      </td>
      <td>{item.name}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>
        <input
          type="number"
          className="item-qty"
          value={item.quantity}
          min="1"
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
              onUpdateQuantity(index, val);
            }
          }}
        />
      </td>
      <td>${itemTotal.toFixed(2)}</td>
    </tr>
  );
}
