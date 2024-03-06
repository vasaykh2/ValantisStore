// src/components/product-list.js
import React, { useState, useEffect } from "react";
import api from "../api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [uniqueIds, setUniqueIds] = useState([]);
  const [repeatedIdsCount, setRepeatedIdsCount] = useState(0);
  const [page, setPage] = useState(1);
 
  let qUseEff = 0;

  useEffect(() => {
    qUseEff += 1;
    // Запрос к API и установка данных о товарах
    const fetchData = async () => {
      try {
        const allIds = await api.getAllIds();
        const itemsPerPage = 50;
        const newUniqueIds = [];
        let newRepeatedIdsCount = 0;        

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
            // Учитываем уже полученные уникальные идентификаторы и не прошедшие проверку в предыдущем цикле
            const offset =
              (page - 1) * itemsPerPage +
              newUniqueIds.length +
              repeatedIdsCount +
              newRepeatedIdsCount;
            const ids = await api.getIds(
              offset,
              itemsPerPage - newUniqueIds.length
            );

            console.log(allIds.length, offset, newUniqueIds.length, ids);

            // Оставляем только уникальные идентификаторы
            const uniqueIdsBatch = Array.from(new Set(ids)).filter(
              (id) => !uniqueIds.includes(id)
            );

            // Подсчитываем количество повторяющихся id в текущей порции
            newRepeatedIdsCount += itemsPerPage - await newUniqueIds.length - uniqueIdsBatch.length;

            // Добавляем уникальные идентификаторы текущей порции к общему списку
            newUniqueIds.push(...uniqueIdsBatch);
          }

          console.log(uniqueIds, newUniqueIds);

          // Обновляем состояние с уникальными идентификаторами

            setUniqueIds((prevUniqueIds) => [
              ...prevUniqueIds,
              ...newUniqueIds,
            ]);

          // Обновляем состояние с количеством повторяющихся идентификаторов
          setRepeatedIdsCount((prevCount) => prevCount + newRepeatedIdsCount);

          // Получаем детали товаров только для уникальных идентификаторов текущей страницы
          const detailedProducts = await api.getItems(newUniqueIds);
          setProducts(detailedProducts);
        }

        console.log(
          page,
          uniqueIds,
          newUniqueIds,
          (page - 1) * itemsPerPage,
          (page - 1) * itemsPerPage + itemsPerPage
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    console.log(`qUseEff >>> ${qUseEff}`);
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
