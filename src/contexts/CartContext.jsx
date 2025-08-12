import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_PREFIX = "/api/v1";

// Hardcoded userId constant for testing
const TEST_USER_ID = 1;

export const CartProvider = ({ userId = TEST_USER_ID, children }) => {
  const [cart, setCart] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCart = async () => {
    if (!userId) {
      console.warn("[fetchCart] No userId provided");
      return;
    }
    console.log(`[fetchCart] Fetching cart for userId: ${userId}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[fetchCart] Token from localStorage:", token);
      const res = await fetch(`${API_PREFIX}/cart/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[fetchCart] Failed with status ${res.status}:`, errorText);
        return;
      }
      const json = await res.json();
      setCart(json.data);
      console.log("[fetchCart] Cart fetched successfully:", json.data);
    } catch (error) {
      console.error("[fetchCart] Exception occurred:", error);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    console.log(`[addItem] Adding productId=${productId} with quantity=${quantity}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[addItem] Token from localStorage:", token);
      const res = await fetch(
        `${API_PREFIX}/cartItem/add?productId=${productId}&quantity=${quantity}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorJson = await res.json();
        console.error(`[addItem] Failed with status ${res.status}:`, errorJson);
        throw new Error(errorJson.message || "Failed to add item");
      }
      const json = await res.json();
      console.log("[addItem] Item added successfully:", json);
      await fetchCart();
    } catch (error) {
      console.error("[addItem] Exception occurred:", error);
    }
  };

  const removeItem = async (itemId) => {
    if (!cart) {
      console.warn("[removeItem] No cart available to remove item from");
      return;
    }
    console.log(`[removeItem] Removing itemId=${itemId} from cartId=${cart.id}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[removeItem] Token from localStorage:", token);
      const res = await fetch(
        `${API_PREFIX}/cartItem/cart/${cart.id}/item/${itemId}/remove`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[removeItem] Failed with status ${res.status}:`, errorText);
        return;
      }
      console.log("[removeItem] Item removed successfully");
      await fetchCart();
    } catch (error) {
      console.error("[removeItem] Exception occurred:", error);
    }
  };

  const updateItem = async (itemId, quantity) => {
    if (!cart) {
      console.warn("[updateItem] No cart available to update item");
      return;
    }
    console.log(`[updateItem] Updating itemId=${itemId} quantity=${quantity} in cartId=${cart.id}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[updateItem] Token from localStorage:", token);
      const res = await fetch(
        `${API_PREFIX}/cartItem/cart/${cart.id}/item/${itemId}/update?quantity=${quantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[updateItem] Failed with status ${res.status}:`, errorText);
        return;
      }
      console.log("[updateItem] Item quantity updated successfully");
      await fetchCart();
    } catch (error) {
      console.error("[updateItem] Exception occurred:", error);
    }
  };

  const clearCart = async () => {
    if (!cart) {
      console.warn("[clearCart] No cart available to clear");
      return;
    }
    console.log(`[clearCart] Clearing cartId=${cart.id}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[clearCart] Token from localStorage:", token);
      const res = await fetch(`${API_PREFIX}/cart/clear/${cart.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[clearCart] Failed with status ${res.status}:`, errorText);
        return;
      }
      console.log("[clearCart] Cart cleared successfully");
      await fetchCart();
    } catch (error) {
      console.error("[clearCart] Exception occurred:", error);
    }
  };

  const fetchTotalPrice = async () => {
    if (!cart) {
      console.warn("[fetchTotalPrice] No cart available to fetch total price");
      return;
    }
    console.log(`[fetchTotalPrice] Fetching total price for cartId=${cart.id}`);
    try {
      const token = localStorage.getItem("token");
      console.log("[fetchTotalPrice] Token from localStorage:", token);
      const res = await fetch(`${API_PREFIX}/cart/totalPrice/${cart.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[fetchTotalPrice] Failed with status ${res.status}:`, errorText);
        return;
      }
      const json = await res.json();
      setTotalPrice(json.data);
      console.log("[fetchTotalPrice] Total price fetched successfully:", json.data);
    } catch (error) {
      console.error("[fetchTotalPrice] Exception occurred:", error);
    }
  };

  useEffect(() => {
    console.log(`[useEffect] userId changed to ${userId}, fetching cart`);
    fetchCart();
  }, [userId]);

  useEffect(() => {
    if (cart?.id) {
      console.log(`[useEffect] cart updated, fetching total price for cartId=${cart.id}`);
      fetchTotalPrice();
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, totalPrice, addItem, removeItem, updateItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
