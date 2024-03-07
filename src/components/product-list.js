// src/components/product-list.js
import React, { useState, useEffect } from "react";
import api from "../api";

const ProductList = () => {
  // Состояние для хранения списка продуктов
  const [products, setProducts] = useState([]);

  // Состояние для хранения идентификаторов и количества повторяющихся идентификаторов
  const [ids, setIds] = useState({ uniqueIds: [[]], repeatedIdsCount: [0] });

  // Состояние для хранения текущей страницы
  const [page, setPage] = useState(1);

  // Состояние для хранения фильтров
  const [filters, setFilters] = useState({ name: "", price: "", brand: "" });

  // Количество товаров, которые нужно отобразить на одной странице
  const itemsPerPage = 50;

  useEffect(() => {
    // Функция для запроса данных у API
    const fetchData = async () => {
      try {
        // Получаем все идентификаторы товаров
        const allIds = await api.getAllIds();

        // Инициализируем переменные для новых данных
        let newUniqueIds = [];
        let newRepeatedIdsCount = 0;
        let uniqueDetailedProducts = [];

        // Вычисляем offset для запроса данных
        let offset =
          (page - 1) * itemsPerPage +
          newUniqueIds.length +
          ids.repeatedIdsCount[page - 1] +
          newRepeatedIdsCount;

        // Проверяем, есть ли необходимость делать новый запрос
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
            // Получаем новые id для текущей страницы
            const newIds = await api.getIds(
              offset,
              itemsPerPage - newUniqueIds.length
            );

            // Оставляем только уникальные id
            const uniqueIdsBatch = Array.from(new Set(newIds)).filter(
              (id) => !ids.uniqueIds[page - 1].includes(id)
            );

            // Добавляем уникальные id к общему списку
            newUniqueIds.push(...uniqueIdsBatch);

            // Подсчитываем количество повторяющихся id
            newRepeatedIdsCount += itemsPerPage - newUniqueIds.length;

            // Получаем детали товаров только для уникальных id текущей страницы
            const detailedProducts = await api.getItems(newUniqueIds);

            // Дополнительно фильтруем только уникальные товары текущей страницы
            uniqueDetailedProducts = detailedProducts.filter(
              (value, index, array) => {
                return array.findIndex((obj) => obj.id === value.id) === index;
              }
            );

            // Обновляем offset для следующего запроса
            offset =
              (page - 1) * itemsPerPage +
              newUniqueIds.length +
              ids.repeatedIdsCount[page - 1] +
              newRepeatedIdsCount;
          }

          // Функция для сравнения двух массивов
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

          // Применяем фильтры только если они установлены
          if (
            filters.name !== "" ||
            filters.price !== "" ||
            filters.brand !== ""
          ) {
            setProducts(
              applyFilters(uniqueDetailedProducts, filters).slice(
                0,
                itemsPerPage
              )
            );
          } else {
            // Если фильтры не установлены, выводим весь список товаров
            setProducts(uniqueDetailedProducts);
          }
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
        console.log(`ids -> ${ids.uniqueIds[page - 1]}, ${ids.repeatedIdsCount[page - 1]}`);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [page, filters]);

  const applyFilters = (data, filters) => {
    return data.filter((product) => {
      return (
        (!filters.name ||
          (product.product &&
            product.product.toLowerCase().includes(filters.name.toLowerCase()))) &&
        (!filters.price ||
          (product.price &&
            product.price.toString().includes(filters.price))) &&
        (!filters.brand ||
          (product.brand &&
            product.brand.toLowerCase().includes(filters.brand.toLowerCase())))
      );
    });
  };

  const handlePreviousPageClick = () => {
    if (page > 1) {
      setPage(page - 1);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  return (
    <div>
      <h1>Список товаров</h1>
      <div>
        <label>
          Название:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Цена:
          <input
            type="text"
            name="price"
            value={filters.price}
            onChange={handleFilterChange}
          />
        </label>
        <label>
          Бренд:
          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
          />
        </label>
      </div>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <p>ID: {product.id}</p>
            <p>Название: {product.product}</p>
            <p>Цена: {product.price}</p>
            <p>Бренд: {product.brand || "Не указан"}</p>
          </li>
        ))}
      </ul>
      <button onClick={handlePreviousPageClick} disabled={page === 1}>
        Предыдущая страница
      </button>
      <button onClick={() => setPage(page + 1)}>Следующая страница</button>
    </div>
  );
};

export default ProductList;

// console.log(
//   `страница -> ${page} length -> ${
//     ids.repeatedIdsCount.length
//   } offset -> ${offset} newUniqueIds.length -> ${
//     newUniqueIds.length
//   } repeatedIdsCount -> ${
//     ids.repeatedIdsCount[page - 1]
//   } newRepeatedIdsCount -> ${newRepeatedIdsCount}`
// );
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
