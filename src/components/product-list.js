import React, { useState, useEffect } from "react";
import api from "../api";
import "./product-list.css";

const ProductList = () => {
  // Состояние для хранения списка продуктов
  const [products, setProducts] = useState([]);
  // Состояние для хранения идентификаторов и количества повторяющихся идентификаторов
  const [ids, setIds] = useState({ uniqueIds: [[]], repeatedIdsCount: [0] });
  // Состояние для хранения текущей страницы
  const [page, setPage] = useState(1);
  // Состояние для хранения фильтров
  const [filters, setFilters] = useState({ name: "", price: "", brand: "" });
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(false);
  // Количество товаров, которые нужно отобразить на одной странице
  const itemsPerPage = 50;

  useEffect(() => {
    // Функция для запроса данных у API
    const fetchData = async () => {
      try {
        setLoading(true); // Устанавливаем loading в true перед запросом

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

          // Применяем фильтры, только если они установлены
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
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Устанавливаем loading в false после завершения запроса
      }
    };

    fetchData();
  }, [page, filters]);

  const applyFilters = (data, filters) => {
    return data.filter((product) => {
      return (
        (!filters.name ||
          (product.product &&
            product.product
              .toLowerCase()
              .includes(filters.name.toLowerCase()))) &&
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
    <div className="container">
      <h1 className="page-title">Список товаров</h1>
      <div className="filters">
        <label>
          Название:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </label>
        <label>
          Цена:
          <input
            type="text"
            name="price"
            value={filters.price}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </label>
        <label>
          Бренд:
          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </label>
      </div>
      {loading ? (
        <div>
      <p className="loader"></p>
      </div>
    ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-card">
              <p>ID: {product.id}</p>
              <p className="name">Название: {product.product}</p>
              <p>Цена: {product.price}</p>
              <p>Бренд: {product.brand || "Не указан"}</p>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handlePreviousPageClick}
        disabled={page === 1}
        className="pagination-button"
      >
        Предыдущая страница
      </button>
      <button onClick={() => setPage(page + 1)} className="pagination-button">
        Следующая страница
      </button>
    </div>
  );
};

export default ProductList;
