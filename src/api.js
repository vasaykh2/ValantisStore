// src/api.js
import md5 from "md5";

const API_URL = "https://api.valantis.store:41000/"; //  URL для api

const authenticate = () => {
  const password = "Valantis"; // Наш пароль
  const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const authString = `${password}_${timestamp}`;
  const xAuth = md5(authString);

  // console.log(xAuth);

  return {
    headers: {
      "X-Auth": xAuth,
      "Content-Type": "application/json",
    },
  };
};

const api = {
  getAllIds: async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "get_ids",
        }),
      });
      const data = await response.json();
      // console.log(data.result);
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },

  getIds: async (offset, limit) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "get_ids",
          params: { offset, limit },
        }),
      });
      const data = await response.json();
      // console.log(data.result);
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },

  getItems: async (ids) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "get_items",
          params: { ids },
        }),
      });
      const data = await response.json();
      // console.log(data.result);

      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },

  getAllFields: async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "get_fields",
        }),
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },

  getFields: async (field, offset, limit) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "get_fields",
          params: { field, offset, limit },
        }),
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },

  filter: async (field, value) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        ...authenticate(),
        body: JSON.stringify({
          action: "filter",
          params: { [field]: value },
        }),
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  },
};

export default api;
