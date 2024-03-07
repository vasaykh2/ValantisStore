// src/components/product-list.js
import React, { useState, useEffect } from "react";
import api from "../api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [uniqueIds, setUniqueIds] = useState([]);
  const [repeatedIdsCount, setRepeatedIdsCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Запрос к API и установка данных о товарах
    const fetchData = async () => {
      try {
        const allIds = await api.getAllIds();
        const itemsPerPage = 50;
        const newUniqueIds = [];
        let newRepeatedIdsCount = 0;
        let uniqueDetailedProducts = [];
        // Учитываем уже полученные уникальные идентификаторы и не прошедшие проверку в предыдущем цикле
        let offset =
        (page - 1) * itemsPerPage +
        newUniqueIds.length +
        repeatedIdsCount +
        newRepeatedIdsCount;

        if (
          // page > uniqueIds / itemsPerPage &&
          allIds.length > uniqueIds.length + repeatedIdsCount
        ) {
          // Выполняем цикл, пока не получим достаточное количество уникальных id для новой страницы
          while (
            newUniqueIds.length < itemsPerPage &&
            allIds.length >
              uniqueIds.length +
                repeatedIdsCount +
                newUniqueIds.length +
                newRepeatedIdsCount
          ) {

            const ids = await api.getIds(
              offset,
              itemsPerPage - newUniqueIds.length
            );

            // console.log(allIds.length, offset, newUniqueIds.length, ids);

            // Оставляем только уникальные идентификаторы
            const uniqueIdsBatch = Array.from(new Set(ids)).filter(
              (id) => !uniqueIds.includes(id)
            );

            // Подсчитываем количество повторяющихся id в текущей порции
            newRepeatedIdsCount += itemsPerPage - newUniqueIds.length - uniqueIdsBatch.length;

            // Добавляем уникальные идентификаторы текущей порции к общему списку
            newUniqueIds.push(...uniqueIdsBatch);
            // Получаем детали товаров только для уникальных идентификаторов текущей страницы
           const detailedProducts = await api.getItems(newUniqueIds);
           uniqueDetailedProducts = detailedProducts.filter(
            (value, index, array) => {
              return array.findIndex((obj) => obj.id === value.id) === index;
            }
          );
          offset =
        (page - 1) * itemsPerPage +
        newUniqueIds.length +
        repeatedIdsCount +
        newRepeatedIdsCount;
          }

          // console.log(uniqueIds, newUniqueIds);

          // Обновляем состояние с уникальными идентификаторами

            setUniqueIds((prevUniqueIds) => [
              ...prevUniqueIds,
              ...newUniqueIds,
            ]);

          // Обновляем состояние с количеством повторяющихся идентификаторов
          setRepeatedIdsCount((prevCount) => prevCount + newRepeatedIdsCount);

          // Получаем детали товаров только для уникальных идентификаторов текущей страницы
          // const detailedProducts = await api.getItems(newUniqueIds);
          setProducts(uniqueDetailedProducts);
        }

        console.log(
          `страница -> ${page}  offset -> ${offset}`
        );
        console.log(
          `uniqueDetailedProducts -> ${uniqueDetailedProducts.length}: ${JSON.stringify(
            uniqueDetailedProducts[0],
            null,
            2
          )} <> ${JSON.stringify(uniqueDetailedProducts[uniqueDetailedProducts.length - 1], null, 2)}`
        );
        console.log(
            `products -> ${products.length}: ${JSON.stringify(
              products[0],
              null,
              2
            )} <> ${JSON.stringify(products[products.length - 1], null, 2)}`
          );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [page]);


  return (
    <div>
      <h1>Список товаров</h1>
      <ul>
        {/* Отображаем каждый товар в списке */}
        {products.map((product) => (
          <li key={product.id}>
            <p>ID: {product.id}</p>
            <p>Название: {product.product}</p>
            <p>Цена: {product.price}</p>
            <p>Бренд: {product.brand || "Не указан"}</p>
          </li>
        ))}
      </ul>
      {/* Кнопки для пагинации */}
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Предыдущая страница
      </button>
      <button onClick={() => setPage(page + 1)}>Следующая страница</button>
    </div>
  );
};

export default ProductList;
