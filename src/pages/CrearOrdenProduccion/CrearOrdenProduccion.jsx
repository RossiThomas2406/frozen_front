import { useState, useEffect } from 'react';
import styles from './CrearOrdenProduccion.module.css';

const CrearOrdenProduccion = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    startDate: '',
    product: '',
    quantity: '',
    expiryDate: '',
    productionLine: '',
    supervisor: '',
    endDate: '',
    instructions: '',
    qualityNotes: ''
  });

  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const productionLineOptions = [
    { value: 'linea-1', label: 'Línea 1 - Pizzas' },
    { value: 'linea-2', label: 'Línea 2 - Empanadas' },
    { value: 'linea-3', label: 'Línea 3 - Pastas' },
    { value: 'linea-4', label: 'Línea 4 - Croquetas' }
  ];

  // Efecto para cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://frozenback-test.up.railway.app/api/productos/tipos-producto/');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }
        const products = await response.json();
        
        // Transformar los datos de la API al formato que necesita el componente
        const transformedProducts = products.map(product => ({
          value: product.id_tipo_producto.toString(),
          label: product.descripcion
        }));
        
        setProductOptions(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        showAlert('Error al cargar los productos: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    // Inicializar fecha y cargar productos
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      startDate: today
    }));

    fetchProducts();
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mostrar alerta
  const showAlert = (message, type) => {
    setAlert({ message, type, visible: true });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.product || !formData.quantity || !formData.productionLine) {
      showAlert('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    // Simular envío exitoso
    showAlert('¡Orden de producción creada exitosamente!', 'success');

    // Resetear formulario después de enviar
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  // Resetear formulario
  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      startDate: today,
      product: '',
      quantity: '',
      expiryDate: '',
      productionLine: '',
      supervisor: '',
      endDate: '',
      instructions: '',
      qualityNotes: ''
    });
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar? Se perderán todos los datos no guardados.')) {
      resetForm();
    }
  };

  return (
    <div className={styles.container}>      
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>Formulario de Creacion de Orden de Produccion</div>
        </div>
      </header>
      
      <div className={styles.formContainer}>
        {alert.visible && (
          <div className={`${styles.alert} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
            {alert.message}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Cargando formulario...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="product" className={styles.required}>
                    Producto
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {productOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.required}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="productionLine" className={styles.required}>
                    Línea de Producción
                  </label>
                  <select
                    id="productionLine"
                    name="productionLine"
                    value={formData.productionLine}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar línea</option>
                    {productionLineOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="startDate" className={styles.required}>
                    Fecha de Inicio Planificada
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Acciones del Formulario */}
            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={handleCancel}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Crear
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CrearOrdenProduccion;