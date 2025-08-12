// src/pages/CartPage.jsx
import React from "react";
import { useCart } from "../../contexts/CartContext";

const CartPage = () => {
  const { cart, totalPrice, removeItem, updateItem, clearCart } = useCart();

  if (!cart || !cart.items || cart.items.length === 0) {
    return <div className="p-6">Your cart is empty.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Shopping Cart</h2>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Product</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Price</th>
            <th className="p-2">Total</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.product?.name || "Unnamed Product"}</td>
              <td className="p-2 text-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, parseInt(e.target.value, 10) || 1)
                  }
                  className="w-16 border rounded p-1 text-center"
                />
              </td>
              <td className="p-2 text-center">${item.product?.price?.toFixed(2) || "0.00"}</td>
              <td className="p-2 text-center">
                ${(item.product?.price * item.quantity).toFixed(2)}
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center">
        <button
          onClick={clearCart}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Cart
        </button>
        <div className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default CartPage;
