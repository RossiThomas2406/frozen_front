import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TablaStockProductos.module.css';

const TablaStockProductos = () => {
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);

  // Fetch productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'https://frozenback-test.up.railway.app/api/productos/listar/'
        );
        console.log('Productos obtenidos:', response.data.results);
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
        setStockLoading(true);
        const stockPromises = products.map(async (product) => {
          try {
            const response = await axios.get(
              `https://frozenback-test.up.railway.app/api/stock/cantidad-disponible/${product.id_producto}/`
            );
            console.log(`Stock para ${product.nombre}:`, response.data.cantidad_disponible);
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
        console.log('Mapa de stock completo:', stockMap);
        setStockData(stockMap);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockForProducts();
  }, [products]);

  const getStockStatus = (productId, stock) => {
    const product = products.find(p => p.id_producto === productId);
    if (!product) {
      console.log(`Producto ${productId} no encontrado`);
      return styles.outOfStock;
    }
    
    console.log(`Evaluando ${product.nombre}: Stock=${stock}, Umbral=${product.umbral_minimo}, Estado=`, 
      stock === 0 ? 'Sin Stock' : 
      stock < product.umbral_minimo ? 'Stock Bajo' : 'En Stock');
    
    if (stock === 0) return styles.outOfStock;
    if (stock < product.umbral_minimo) return styles.lowStock;
    return styles.inStock;
  };

  const getStockStatusText = (productId, stock) => {
    const product = products.find(p => p.id_producto === productId);
    if (!product) return 'Sin Stock';
    
    if (stock === 0) return 'Sin Stock';
    if (stock < product.umbral_minimo) return 'Stock Bajo';
    return 'En Stock';
  };

  const getStockIcon = (productId, stock) => {
    const product = products.find(p => p.id_producto === productId);
    if (!product) return '❌';
    
    if (stock === 0) return '❌';
    if (stock < product.umbral_minimo) return '⚠️';
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
      </header>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {products.map((product) => {
          const currentStock = stockData[product.id_producto];
          const isStockLoaded = currentStock !== undefined;
          
          return (
            <div key={product.id_producto} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.productName}>{product.nombre}</h3>
                <span className={styles.stockIcon}>
                  {isStockLoaded 
                    ? getStockIcon(product.id_producto, currentStock)
                    : '⏳'}
                </span>
              </div>
              
              <p className={styles.description}>{product.descripcion}</p>
              
              <div className={styles.stockInfo}>
                <div className={styles.stockQuantity}>
                  <span className={styles.quantity}>
                    {isStockLoaded ? currentStock : '...'}
                  </span>
                  <span className={styles.unit}>{product.unidad_medida}</span>
                </div>
                
                <div className={`${styles.status} ${
                  isStockLoaded 
                    ? getStockStatus(product.id_producto, currentStock)
                    : styles.loading
                }`}>
                  {isStockLoaded 
                    ? getStockStatusText(product.id_producto, currentStock)
                    : 'Cargando...'}
                </div>
              </div>

              {/* Información del umbral mínimo */}
              <div className={styles.thresholdInfo}>
                <span className={styles.thresholdLabel}>Umbral mínimo:</span>
                <span className={styles.thresholdValue}>
                  {product.umbral_minimo} {product.unidad_medida}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TablaStockProductos;