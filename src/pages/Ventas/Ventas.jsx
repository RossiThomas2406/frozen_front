import React, { useState, useEffect } from "react";
// import axios from "axios"; // Descomentar cuando la API esté lista
import styles from "./Ventas.module.css";

function Ventas() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordenEditando, setOrdenEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Datos mockeados para PYME de alimentos congelados
  const datosMock = [
    {
      id: 1,
      nombreCliente: "Supermercado La Economía",
      fechaEmision: "2024-01-15",
      fechaEntregaEstimada: "2024-01-17",
      prioridad: "normal",
      productos: [
        {
          nombre: "Pizza de jamón y queso",
          cantidad: 50,
          unidadMedida: "unidades"
        },
        {
          nombre: "Hamburguesas de carne",
          cantidad: 100,
          unidadMedida: "unidades"
        },
        {
          nombre: "Papas fritas",
          cantidad: 25,
          unidadMedida: "kg"
        },
        {
          nombre: "Helado de vainilla",
          cantidad: 30,
          unidadMedida: "litros"
        }
      ]
    },
    {
      id: 2,
      nombreCliente: "Restaurante El Fogón",
      fechaEmision: "2024-01-16",
      fechaEntregaEstimada: "2024-01-18",
      prioridad: "alta",
      productos: [
        {
          nombre: "Camaronés empanizados",
          cantidad: 15,
          unidadMedida: "kg"
        },
        {
          nombre: "Vegetales mixtos",
          cantidad: 20,
          unidadMedida: "kg"
        },
        {
          nombre: "Pollo precocido",
          cantidad: 25,
          unidadMedida: "kg"
        },
        {
          nombre: "Base para pizza",
          cantidad: 40,
          unidadMedida: "unidades"
        }
      ]
    }
  ];

  // IMPLEMENTACIÓN CON API AXIOS (COMENTADA - ACTIVAR CUANDO LA API ESTÉ LISTA)
  /*
  const fetchOrdenesAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // NOTA: Cambiar la URL por el endpoint real de tu API
      const response = await axios.get("/api/ordenes-venta/activas");
      
      // Asegurarnos de que siempre sea un array
      const ordenesData = response.data || [];
      setOrdenes(Array.isArray(ordenesData) ? ordenesData : []);
      
    } catch (err) {
      setError("Error al cargar las órdenes de venta");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };
  */

  // IMPLEMENTACIÓN CON DATOS MOCK (ACTUALMENTE ACTIVA)
  const fetchOrdenesMock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simular éxito o error aleatorio (opcional, para testing)
      const shouldFail = false; // Cambiar a true para probar el estado de error
      
      if (shouldFail) {
        throw new Error("Error simulado de conexión");
      }
      
      setOrdenes(datosMock);
      
    } catch (err) {
      setError("Error al cargar las órdenes de venta: " + err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar los cambios de la orden
  const guardarOrden = async (ordenActualizada) => {
    try {
      setGuardando(true);
      
      // IMPLEMENTACIÓN CON API AXIOS (COMENTADA - ACTIVAR CUANDO LA API ESTÉ LISTA)
      /*
      const response = await axios.put(`/api/ordenes-venta/${ordenActualizada.id}`, ordenActualizada);
      
      if (response.status === 200) {
        // Actualizar el estado local con la orden modificada
        setOrdenes(prevOrdenes => 
          prevOrdenes.map(orden => 
            orden.id === ordenActualizada.id ? ordenActualizada : orden
          )
        );
        
        cerrarModal();
        
        // Opcional: Mostrar mensaje de éxito
        alert('Orden actualizada correctamente');
      }
      */
      
      // IMPLEMENTACIÓN MOCK (ACTUALMENTE ACTIVA)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de guardado
      
      // Actualizar el estado local con la orden modificada
      setOrdenes(prevOrdenes => 
        prevOrdenes.map(orden => 
          orden.id === ordenActualizada.id ? ordenActualizada : orden
        )
      );
      
      cerrarModal();
      
      // Mostrar mensaje de éxito
      alert('Orden actualizada correctamente (modo demo)');
      
    } catch (err) {
      console.error("Error al guardar la orden:", err);
      alert('Error al guardar la orden: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Función principal que decide qué implementación usar
  const fetchOrdenes = async () => {
    // Para cambiar a la API real, simplemente cambiar fetchOrdenesMock por fetchOrdenesAPI
    await fetchOrdenesMock(); // ← CAMBIAR POR fetchOrdenesAPI CUANDO LA API ESTÉ LISTA
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Función para formatear fechas
  const formatFecha = (fechaString) => {
    if (!fechaString) return "No especificada";
    try {
      return new Date(fechaString).toLocaleDateString('es-ES');
    } catch (error) {
      console.log(error)
      return "Fecha inválida";
    }
  };

  // Función para obtener el texto y clase CSS según la prioridad
  const getPrioridadInfo = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return { texto: 'URGENTE', clase: styles.prioridadUrgente };
      case 'alta':
        return { texto: 'ALTA', clase: styles.prioridadAlta };
      case 'normal':
        return { texto: 'NORMAL', clase: styles.prioridadNormal };
      case 'baja':
        return { texto: 'BAJA', clase: styles.prioridadBaja };
      default:
        return { texto: 'NORMAL', clase: styles.prioridadNormal };
    }
  };

  const abrirModal = (orden) => {
    setOrdenEditando({...orden});
  };

  const cerrarModal = () => {
    setOrdenEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrdenEditando(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductoChange = (index, field, value) => {
    setOrdenEditando(prev => {
      const nuevosProductos = [...prev.productos];
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        [field]: value
      };
      return {
        ...prev,
        productos: nuevosProductos
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarOrden(ordenEditando);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingIcon}>❄️</div>
          Cargando órdenes de venta...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
          <button onClick={fetchOrdenes} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <span className={styles.titleIcon}>❄️</span>
        Órdenes de Venta
      </h1>
      
      {ordenes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧊</div>
          No hay órdenes de venta activas en este momento.
        </div>
      ) : (
        <div className={styles.ordenesList}>
          {ordenes.map((orden) => {
            const prioridadInfo = getPrioridadInfo(orden.prioridad);
            
            return (
              <div key={orden.id} className={styles.ordenCard}>
                <div className={styles.ordenHeader}>
                  <div>
                    <h2 className={styles.ordenId}>Orden #{orden.id}</h2>
                  </div>
                  <span className={styles.clienteNombre}>{orden.nombreCliente}</span>
                </div>
                
                <div className={styles.ordenDates}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>📅 Emisión:</span>
                    <span className={styles.dateValue}>{formatFecha(orden.fechaEmision)}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>🚚 Entrega estimada:</span>
                    <span className={styles.dateValue}>{formatFecha(orden.fechaEntregaEstimada)}</span>
                  </div>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>⏱️ Prioridad:</span>
                    <span className={`${styles.prioridad} ${prioridadInfo.clase}`}>
                      {prioridadInfo.texto}
                    </span>
                  </div>
                </div>
                
                <div className={styles.productosSection}>
                  <h3 className={styles.productosTitle}>
                    Productos ({orden.productos.length} tipos):
                  </h3>
                  <div className={styles.productosList}>
                    {orden.productos.map((producto, index) => (
                      <div key={index} className={styles.productoItem}>
                        <span className={styles.productoNombre}>
                          {producto.nombre}
                        </span>
                        <span className={styles.productoDetalle}>
                          <strong>{producto.cantidad}</strong> {producto.unidadMedida}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.ordenFooter}>
                  <button 
                    className={styles.detalleButton}
                    onClick={() => abrirModal(orden)}
                  >
                    Ver detalles completos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      {ordenEditando && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Editar Orden #{ordenEditando.id}</h2>
              <button className={styles.closeButton} onClick={cerrarModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Cliente:</label>
                <input
                  type="text"
                  name="nombreCliente"
                  value={ordenEditando.nombreCliente}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Fecha Emisión:</label>
                  <input
                    type="date"
                    name="fechaEmision"
                    value={ordenEditando.fechaEmision}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Fecha Entrega Estimada:</label>
                  <input
                    type="date"
                    name="fechaEntregaEstimada"
                    value={ordenEditando.fechaEntregaEstimada}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Prioridad:</label>
                <select
                  name="prioridad"
                  value={ordenEditando.prioridad}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              
              <div className={styles.productosEditSection}>
                <h3>Productos:</h3>
                {ordenEditando.productos.map((producto, index) => (
                  <div key={index} className={styles.productoEditItem}>
                    <input
                      type="text"
                      value={producto.nombre}
                      onChange={(e) => handleProductoChange(index, 'nombre', e.target.value)}
                      className={styles.input}
                      placeholder="Nombre del producto"
                    />
                    <input
                      type="number"
                      value={producto.cantidad}
                      onChange={(e) => handleProductoChange(index, 'cantidad', parseFloat(e.target.value))}
                      className={styles.inputCantidad}
                      placeholder="Cantidad"
                    />
                    <select
                      value={producto.unidadMedida}
                      onChange={(e) => handleProductoChange(index, 'unidadMedida', e.target.value)}
                      className={styles.selectUnidad}
                    >
                      <option value="unidades">Unidades</option>
                      <option value="kg">Kg</option>
                      <option value="litros">Litros</option>
                      <option value="cajas">Cajas</option>
                    </select>
                  </div>
                ))}
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ventas;