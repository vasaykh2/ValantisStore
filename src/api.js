// src/api.js
import md5 from "md5";

const API_URL = "https://api.valantis.store:41000/";

const authenticate = () => {
  const password = "Valantis";
  const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const authString = `${password}_${timestamp}`;
  const xAuth = md5(authString);

  return {
    headers: {
      "X-Auth": xAuth,
      "Content-Type": "application/json",
    },
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
};

const retryFetch = async (url, options, retries) => {
  let retryCount = retries;

  while (retryCount > 0) {
    try {
      const response = await fetch(url, options);
      return handleResponse(response);
    } catch (error) {
      console.error("Error:", error);
      retryCount--;
    }
  }

  return [];
};

const api = {
  getAllIds: async () => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_ids",
      }),
    };

    return retryFetch(API_URL, options, 3);
  },

  getIds: async (offset, limit) => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_ids",
        params: { offset, limit },
      }),
    };

    return retryFetch(API_URL, options, 3);
  },

  getItems: async (ids) => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_items",
        params: { ids },
      }),
    };

    return retryFetch(API_URL, options, 3);
  },

  getAllFields: async () => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_fields",
      }),
    };

    return retryFetch(API_URL, options, 3);
  },

  getFields: async (field, offset, limit) => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_fields",
        params: { field, offset, limit },
      }),
    };

    return retryFetch(API_URL, options, 3);
  },

  filter: async (field, value) => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "filter",
        params: { [field]: value },
      }),
    };

    return retryFetch(API_URL, options, 3);
  },
};

export default api;

// console.log(xAuth);
