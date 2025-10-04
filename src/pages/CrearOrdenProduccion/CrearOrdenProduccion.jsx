import { useState, useEffect } from 'react';
import styles from './CrearOrdenProduccion.module.css';

const CrearOrdenProduccion = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    orderNumber: '',
    orderDate: '',
    priority: '',
    status: 'pendiente',
    product: '',
    quantity: '',
    batchNumber: '',
    expiryDate: '',
    productionLine: '',
    supervisor: '',
    startDate: '',
    endDate: '',
    instructions: '',
    qualityNotes: ''
  });

  const [materials, setMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    material: '',
    quantity: '',
    unit: 'kg'
  });
  const [qualityChecks, setQualityChecks] = useState([]);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });

  // Opciones para los selects
  const productOptions = [
    { value: 'pizza-margarita', label: 'Pizza Margarita' },
    { value: 'empanada-carne', label: 'Empanada de Carne' },
    { value: 'lasagna', label: 'Lasagna' },
    { value: 'croquetas-pollo', label: 'Croquetas de Pollo' },
    { value: 'hamburguesa-vegetal', label: 'Hamburguesa Vegetal' }
  ];

  const materialOptions = [
    { value: 'harina', label: 'Harina' },
    { value: 'queso-mozzarella', label: 'Queso Mozzarella' },
    { value: 'carne-molida', label: 'Carne Molida' },
    { value: 'pollo', label: 'Pollo' },
    { value: 'tomate', label: 'Tomate' },
    { value: 'cebolla', label: 'Cebolla' }
  ];

  const productionLineOptions = [
    { value: 'linea-1', label: 'Línea 1 - Pizzas' },
    { value: 'linea-2', label: 'Línea 2 - Empanadas' },
    { value: 'linea-3', label: 'Línea 3 - Pastas' },
    { value: 'linea-4', label: 'Línea 4 - Croquetas' }
  ];

  const qualityCheckOptions = [
    { value: 'temperatura', label: 'Temperatura de Congelación' },
    { value: 'peso', label: 'Peso del Producto' },
    { value: 'apariencia', label: 'Apariencia Visual' },
    { value: 'empaque', label: 'Integridad del Empaque' },
    { value: 'etiquetado', label: 'Etiquetado Correcto' }
  ];

  // Efecto para inicializar datos
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const orderNumber = `OP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    setFormData(prev => ({
      ...prev,
      orderNumber,
      orderDate: today
    }));
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en materiales
  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar material a la lista
  const handleAddMaterial = () => {
    if (!currentMaterial.material || !currentMaterial.quantity) {
      showAlert('Por favor, selecciona una materia prima y especifica la cantidad.', 'error');
      return;
    }

    const materialLabel = materialOptions.find(m => m.value === currentMaterial.material)?.label;
    
    setMaterials(prev => [...prev, {
      ...currentMaterial,
      id: Date.now(),
      materialLabel
    }]);

    // Limpiar campos de material
    setCurrentMaterial({
      material: '',
      quantity: '',
      unit: 'kg'
    });
  };

  // Eliminar material de la lista
  const handleRemoveMaterial = (id) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  // Manejar checks de calidad
  const handleQualityCheckChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setQualityChecks(prev => [...prev, value]);
    } else {
      setQualityChecks(prev => prev.filter(check => check !== value));
    }
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
    if (!formData.orderNumber || !formData.product || !formData.quantity) {
      showAlert('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    // Preparar datos para enviar
    const submissionData = {
      ...formData,
      materials,
      qualityChecks
    };

    console.log('Datos a enviar:', submissionData);

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
    const orderNumber = `OP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    setFormData({
      orderNumber,
      orderDate: today,
      priority: '',
      status: 'pendiente',
      product: '',
      quantity: '',
      batchNumber: '',
      expiryDate: '',
      productionLine: '',
      supervisor: '',
      startDate: '',
      endDate: '',
      instructions: '',
      qualityNotes: ''
    });
    
    setMaterials([]);
    setQualityChecks([]);
    setCurrentMaterial({
      material: '',
      quantity: '',
      unit: 'kg'
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
          <div className={styles.logo}>FrozenFoods S.A.</div>
          <div>Sistema de Órdenes de Producción</div>
        </div>
      </header>
      
      <div className={styles.formContainer}>
        <h1>Crear Nueva Orden de Producción</h1>
        
        {alert.visible && (
          <div className={`${styles.alert} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
            {alert.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información General */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Información General</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="orderNumber" className={styles.required}>
                  Número de Orden
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="orderDate" className={styles.required}>
                  Fecha de Creación
                </label>
                <input
                  type="date"
                  id="orderDate"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="priority" className={styles.required}>
                  Prioridad
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar prioridad</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en-proceso">En Proceso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Producto a Producir */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Producto a Producir</h2>
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
                <label htmlFor="batchNumber">Número de Lote</label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="expiryDate">Fecha de Vencimiento</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Materias Primas */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Materias Primas</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="rawMaterial">Materia Prima</label>
                <select
                  id="rawMaterial"
                  name="material"
                  value={currentMaterial.material}
                  onChange={handleMaterialChange}
                >
                  <option value="">Seleccionar materia prima</option>
                  {materialOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="rawMaterialQuantity">Cantidad</label>
                <input
                  type="number"
                  id="rawMaterialQuantity"
                  name="quantity"
                  value={currentMaterial.quantity}
                  onChange={handleMaterialChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="rawMaterialUnit">Unidad</label>
                <select
                  id="rawMaterialUnit"
                  name="unit"
                  value={currentMaterial.unit}
                  onChange={handleMaterialChange}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="unidades">unidades</option>
                </select>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleAddMaterial}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Agregar Materia Prima
            </button>
            
            <div className={styles.materialsList}>
              {materials.map(material => (
                <div key={material.id} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <strong>{material.materialLabel}</strong> - {material.quantity} {material.unit}
                  </div>
                  <div className={styles.productActions}>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMaterial(material.id)}
                      className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones de Producción */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Instrucciones de Producción</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="productionLine">Línea de Producción</label>
                <select
                  id="productionLine"
                  name="productionLine"
                  value={formData.productionLine}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar línea</option>
                  {productionLineOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="supervisor">Supervisor Responsable</label>
                <input
                  type="text"
                  id="supervisor"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startDate">Fecha de Inicio Programada</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="endDate">Fecha de Finalización Programada</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="instructions">Instrucciones Especiales</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Control de Calidad */}
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Control de Calidad</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="qualityChecks">Puntos de Control de Calidad</label>
                <div className={styles.checkboxGroup}>
                  {qualityCheckOptions.map(option => (
                    <label key={option.value} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={qualityChecks.includes(option.value)}
                        onChange={handleQualityCheckChange}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <small>Selecciona todos los puntos de control que apliquen</small>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="qualityNotes">Notas de Calidad</label>
                <textarea
                  id="qualityNotes"
                  name="qualityNotes"
                  value={formData.qualityNotes}
                  onChange={handleInputChange}
                  rows="3"
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
              Crear Orden de Producción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearOrdenProduccion;