// src/components/ProductList.js
import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Код для выполнения запроса к API и установки данных о товарах
  }, [page]);

  return (
    <div>
      <h1>Список товаров</h1>
      <ul>
        {/* Отображение каждого товара в списке */}
        {products.map((product) => (
          <li key={product.id}>
            <p>ID: {product.id}</p>
            <p>Название: {product.product}</p>
            <p>Цена: {product.price}</p>
            <p>Бренд: {product.brand || 'Не указан'}</p>
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
