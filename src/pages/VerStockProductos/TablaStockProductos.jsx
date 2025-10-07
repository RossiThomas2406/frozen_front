import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TablaStockProductos.module.css';

const TablaStockProductos = () => {
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'https://frozenback-test.up.railway.app/api/productos/listar/'
        );
        setProducts(response.data.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch stock para cada producto
  useEffect(() => {
    const fetchStockForProducts = async () => {
      if (products.length === 0) return;

      try {
        const stockPromises = products.map(async (product) => {
          try {
            const response = await axios.get(
              `https://frozenback-test.up.railway.app/api/stock/cantidad-disponible/${product.id_producto}/`
            );
            return {
              productId: product.id_producto,
              stock: response.data.cantidad_disponible
            };
          } catch (error) {
            console.error(`Error fetching stock for product ${product.id_producto}:`, error);
            return {
              productId: product.id_producto,
              stock: 0
            };
          }
        });

        const stockResults = await Promise.all(stockPromises);
        const stockMap = {};
        stockResults.forEach(result => {
          stockMap[result.productId] = result.stock;
        });
        setStockData(stockMap);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockForProducts();
  }, [products]);

  const getStockStatus = (stock) => {
    if (stock === 0) return styles.outOfStock;
    if (stock < 50) return styles.lowStock;
    return styles.inStock;
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Sin Stock';
    if (stock < 50) return 'Stock Bajo';
    return 'En Stock';
  };

  const getStockIcon = (stock) => {
    if (stock === 0) return '❌';
    if (stock < 50) return '⚠️';
    return '✅';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Inventario de Productos</h1>
        <p className={styles.subtitle}>
          Gestión y visualización del stock disponible
        </p>
        <div className={styles.summary}>
          Total de productos: <strong>{products.length}</strong>
        </div>
      </header>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {products.map((product) => (
          <div key={product.id_producto} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.productName}>{product.nombre}</h3>
              <span className={styles.stockIcon}>
                {getStockIcon(stockData[product.id_producto])}
              </span>
            </div>
            
            <p className={styles.description}>{product.descripcion}</p>
            
            <div className={styles.stockInfo}>
              <div className={styles.stockQuantity}>
                <span className={styles.quantity}>
                  {stockData[product.id_producto] !== undefined 
                    ? stockData[product.id_producto] 
                    : '...'}
                </span>
                <span className={styles.unit}>{product.unidad_medida}</span>
              </div>
              
              <div className={`${styles.status} ${getStockStatus(stockData[product.id_producto])}`}>
                {stockData[product.id_producto] !== undefined 
                  ? getStockStatusText(stockData[product.id_producto])
                  : 'Cargando...'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda de Estados */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.inStock}`}></span>
          <span>En Stock</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.lowStock}`}></span>
          <span>Stock Bajo</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.outOfStock}`}></span>
          <span>Sin Stock</span>
        </div>
      </div>
    </div>
  );
};

export default TablaStockProductos;