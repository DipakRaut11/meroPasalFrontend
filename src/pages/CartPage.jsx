// pages/CartPage.js
import React from "react";
import { useCart } from "../contexts/CartContext";

const CartPage = () => {
  const { cart, totalPrice, removeItem, updateItem, clearCart } = useCart();
  if (!cart) return <p>Loading cart...</p>;
  return (
    <div>
      <h2>Your Cart</h2>
      {cart.items.length === 0
        ? <p>Cart is empty.</p>
        : (
          <>
            <ul>
              {cart.items.map(item => (
                <li key={item.id}>
                  {item.product.name} — ₹{item.unitPrice} × {item.quantity} = ₹{item.unitPrice * item.quantity}
                  <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                  <button onClick={() => removeItem(item.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <p><strong>Total: ₹{totalPrice}</strong></p>
            <button onClick={clearCart}>Clear Cart</button>
          </>
        )
      }
    </div>
  );
};
export default CartPage;
