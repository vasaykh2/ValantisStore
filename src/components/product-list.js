// src/components/product-list.js
import React, { useState, useEffect } from "react";
import api from "../api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState({ uniqueIds: [[]], repeatedIdsCount: [0] });
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    // Запрос к API и установка данных о товарах
    const fetchData = async () => {
      try {
        const allIds = await api.getAllIds();
        let newUniqueIds = [];
        let newRepeatedIdsCount = 0;
        let uniqueDetailedProducts = [];
        // Учитываем уже полученные уникальные идентификаторы и не прошедшие проверку в предыдущем цикле
        let offset =
          (page - 1) * itemsPerPage +
          newUniqueIds.length +
          ids.repeatedIdsCount[page - 1] +
          newRepeatedIdsCount;

        if (
          allIds.length >
          ids.uniqueIds[page - 1].length + ids.repeatedIdsCount[page - 1]
        ) {
          // Выполняем цикл, пока не получим достаточное количество уникальных id для новой страницы
          while (
            newUniqueIds.length < itemsPerPage &&
            allIds.length >
              ids.uniqueIds[page - 1].length +
                ids.repeatedIdsCount[page - 1] +
                newUniqueIds.length +
                newRepeatedIdsCount
          ) {
            const newIds = await api.getIds(
              offset,
              itemsPerPage - newUniqueIds.length
            );

            // Оставляем только уникальные идентификаторы
            const uniqueIdsBatch = Array.from(new Set(newIds)).filter(
              (id) => !ids.uniqueIds[page - 1].includes(id)
            );

            // Добавляем уникальные идентификаторы текущей порции к общему списку
            newUniqueIds.push(...uniqueIdsBatch);
            // Подсчитываем количество повторяющихся id в текущей порции
            newRepeatedIdsCount += itemsPerPage - newUniqueIds.length;
            // Получаем детали товаров только для уникальных идентификаторов текущей страницы
            const detailedProducts = await api.getItems(newUniqueIds);
            // Дополнительно отфильтровываем только уникальные товары текущей страницы
            uniqueDetailedProducts = detailedProducts.filter(
              (value, index, array) => {
                return array.findIndex((obj) => obj.id === value.id) === index;
              }
            );
            offset =
              (page - 1) * itemsPerPage +
              newUniqueIds.length +
              ids.repeatedIdsCount[page - 1] +
              newRepeatedIdsCount;
          }

          const arraysAreEqual = (arr1, arr2) => {
            if (arr1.length !== arr2.length) {
              return false;
            }
            for (let i = 0; i < arr1.length; i++) {
              if (arr1[i] !== arr2[i]) {
                return false;
              }
            }
            return true;
          };
          // Обновляем состояние с уникальными идентификаторами и количеством повторяющихся идентификаторов
          setIds((prevIds) => {
            // Проверяем, чтобы избежать дублирования объектов
            const lastUniqueIds =
              prevIds.uniqueIds[prevIds.uniqueIds.length - 1];
            if (!arraysAreEqual(lastUniqueIds, newUniqueIds)) {
              const updatedUniqueIds = [...prevIds.uniqueIds, newUniqueIds];
              const updatedRepeatedIdsCount = [
                ...prevIds.repeatedIdsCount,
                prevIds.repeatedIdsCount[prevIds.repeatedIdsCount.length - 1] +
                  newRepeatedIdsCount,
              ];
              // Возвращаем обновленное состояние
              return {
                uniqueIds: updatedUniqueIds,
                repeatedIdsCount: updatedRepeatedIdsCount,
              };
            }
            // Возвращаем предыдущее состояние, если новые данные совпадают с последними
            return prevIds;
          });

          setProducts(uniqueDetailedProducts);
        }

        console.log(
          `страница -> ${page} length -> ${
            ids.repeatedIdsCount.length
          } offset -> ${offset} newUniqueIds.length -> ${
            newUniqueIds.length
          } repeatedIdsCount -> ${
            ids.repeatedIdsCount[page - 1]
          } newRepeatedIdsCount -> ${newRepeatedIdsCount}`
        );
        // console.log(
        //   `uniqueDetailedProducts -> ${
        //     uniqueDetailedProducts.length
        //   }: ${JSON.stringify(
        //     uniqueDetailedProducts[0],
        //     null,
        //     2
        //   )} <> ${JSON.stringify(
        //     uniqueDetailedProducts[uniqueDetailedProducts.length - 1],
        //     null,
        //     2
        //   )}`
        // );
        // console.log(
        //   `products -> ${products.length}: ${JSON.stringify(
        //     products[0],
        //     null,
        //     2
        //   )} <> ${JSON.stringify(products[products.length - 1], null, 2)}`
        // );
        // console.log(`ids -> ${JSON.stringify(ids, null, 2)}`);
        // console.log(`ids -> ${ids.uniqueIds[page - 1]}, ${ids.repeatedIdsCount[page - 1]}`, uniqueIds, repeatedIdsCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [page]);

  const handlePreviousPageClick = () => {
    // Проверяем, что текущая страница больше 1
    if (page > 1) {
      // Уменьшаем номер страницы
      setPage(page - 1);

      // Удаляем данные последней страницы из состояния
      setIds((prevIds) => {
        const updatedUniqueIds = prevIds.uniqueIds.slice(0, -1);
        const updatedRepeatedIdsCount = prevIds.repeatedIdsCount.slice(0, -1);

        return {
          uniqueIds: updatedUniqueIds,
          repeatedIdsCount: updatedRepeatedIdsCount,
        };
      });
    }
  };

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
      <button onClick={handlePreviousPageClick} disabled={page === 1}>
        Предыдущая страница
      </button>
      <button onClick={() => setPage(page + 1)}>Следующая страница</button>
    </div>
  );
};

export default ProductList;
