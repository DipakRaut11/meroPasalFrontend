import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_PREFIX = "/api/v1";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCart = async () => {
    console.log("[fetchCart] Fetching cart for logged-in user");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.warn("[fetchCart] No token found");
        return;
      }
      const res = await fetch(`${API_PREFIX}/cart/my-cart`, {
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
      const token = sessionStorage.getItem("token");
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
      await fetchCart();
    } catch (error) {
      console.error("[addItem] Exception occurred:", error);
    }
  };

  const removeItem = async (itemId) => {
    if (!cart) return;
    try {
      const token = sessionStorage.getItem("token");
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
      await fetchCart();
    } catch (error) {
      console.error("[removeItem] Exception occurred:", error);
    }
  };

  const updateItem = async (itemId, quantity) => {
    if (!cart) return;
    try {
      const token = sessionStorage.getItem("token");
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
      await fetchCart();
    } catch (error) {
      console.error("[updateItem] Exception occurred:", error);
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    try {
      const token = sessionStorage.getItem("token");
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
      await fetchCart();
    } catch (error) {
      console.error("[clearCart] Exception occurred:", error);
    }
  };

  const fetchTotalPrice = async () => {
    if (!cart) return;
    try {
      const token = sessionStorage.getItem("token");
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
    } catch (error) {
      console.error("[fetchTotalPrice] Exception occurred:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart?.id) {
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
