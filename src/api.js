import md5 from "md5";

const API_URL = "https://api.valantis.store:41000/";
const numberRetries = 5;

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
      // Проверяем успешность запроса
      if (response.ok) {
        return handleResponse(response);
      } else {
        // Если запрос неудачен, уменьшаем retryCount и продолжаем цикл
        retryCount--;
        // Выводим идентификатор ошибки и сообщение о попытке
        console.error(
          `HTTP error! Status: ${response.status}, Retry attempts left: ${retryCount}`
        );
      }
    } catch (error) {
      // Если произошла ошибка, уменьшаем retryCount и продолжаем цикл
      retryCount--;
      // Выводим идентификатор ошибки и сообщение о попытке
      console.error("Error:", error, `Retry attempts left: ${retryCount}`);
    }
  }
  // Если исчерпаны все попытки, генерируем ошибку
  throw new Error("Failed to fetch data after multiple attempts");
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

    return retryFetch(API_URL, options, numberRetries);
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

    return retryFetch(API_URL, options, numberRetries);
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

    return retryFetch(API_URL, options, numberRetries);
  },

  getAllFields: async () => {
    const options = {
      method: "POST",
      ...authenticate(),
      body: JSON.stringify({
        action: "get_fields",
      }),
    };

    return retryFetch(API_URL, options, numberRetries);
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

    return retryFetch(API_URL, options, numberRetries);
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

    return retryFetch(API_URL, options, numberRetries);
  },
};

export default api;
