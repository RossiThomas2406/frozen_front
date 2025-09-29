import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Ventas.module.css";

function Ventas() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordenEditando, setOrdenEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // URL base de la API
  const API_BASE_URL = "https://frozenback-production.up.railway.app/api/ventas";

  // Obtener órdenes de venta
  const fetchOrdenesAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/ordenes-venta/`);
      console.log(response.data);
      
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

  // Función para guardar los cambios de la orden usando PUT
  const guardarOrden = async (ordenActualizada) => {
    try {
      setGuardando(true);
      
      // Preparar los datos para enviar a la API
      const datosActualizados = {
        id_orden_venta: ordenActualizada.id_orden_venta,
        cliente: {
          id_cliente: ordenActualizada.cliente.id_cliente,
          nombre: ordenActualizada.cliente.nombre
        },
        fecha: ordenActualizada.fecha,
        fechaEntregaEstimada: ordenActualizada.fechaEntregaEstimada,
        prioridad: ordenActualizada.prioridad,
        productos: ordenActualizada.productos.map(producto => ({
          id_producto: producto.producto.id_producto,
          cantidad: producto.cantidad,
          producto: {
            id_producto: producto.producto.id_producto,
            descripcion: producto.producto.descripcion,
            unidad: {
              id_unidad: producto.producto.unidad.id_unidad,
              descripcion: producto.producto.unidad.descripcion
            }
          }
        }))
      };

      console.log("Enviando datos actualizados:", datosActualizados);

      // Llamada PUT a la API
      const response = await axios.put(
        `${API_BASE_URL}/ordenes-venta/${ordenActualizada.id_orden_venta}/`, 
        datosActualizados,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.status === 200) {
        // Actualizar el estado local con la orden modificada
        setOrdenes(prevOrdenes => 
          prevOrdenes.map(orden => 
            orden.id_orden_venta === ordenActualizada.id_orden_venta ? response.data : orden
          )
        );
        
        cerrarModal();
        
        // Mostrar mensaje de éxito
        alert('Orden actualizada correctamente');
      }
      
    } catch (err) {
      console.error("Error al guardar la orden:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      alert('Error al guardar la orden: ' + errorMessage);
    } finally {
      setGuardando(false);
    }
  };

  // Función principal que decide qué implementación usar
  const fetchOrdenes = async () => {
    await fetchOrdenesAPI();
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

  // Función para formatear fecha para input type="date"
  const formatFechaParaInput = (fechaString) => {
    if (!fechaString) return "";
    try {
      const fecha = new Date(fechaString);
      return fecha.toISOString().split('T')[0];
    } catch (error) {
      return "";
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
    setOrdenEditando({
      ...orden,
      // Crear una copia profunda para evitar mutaciones
      productos: orden.productos.map(producto => ({
        ...producto,
        producto: { ...producto.producto },
        cantidad: producto.cantidad
      }))
    });
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
      
      if (field === 'cantidad') {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          [field]: parseFloat(value) || 0
        };
      } else if (field === 'descripcion') {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          producto: {
            ...nuevosProductos[index].producto,
            descripcion: value
          }
        };
      } else if (field === 'unidad') {
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          producto: {
            ...nuevosProductos[index].producto,
            unidad: {
              ...nuevosProductos[index].producto.unidad,
              descripcion: value
            }
          }
        };
      }
      
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
              <div key={orden.id_orden_venta} className={styles.ordenCard}>
                <div className={styles.ordenHeader}>
                  <div>
                    <h2 className={styles.ordenId}>Orden #{orden.id_orden_venta}</h2>
                  </div>
                  <span className={styles.clienteNombre}>{orden.cliente.nombre}</span>
                </div>
                
                <div className={styles.ordenDates}>
                  <div className={styles.dateItem}>
                    <span className={styles.dateLabel}>📅 Emisión:</span>
                    <span className={styles.dateValue}>{formatFecha(orden.fecha)}</span>
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
                          {producto.producto.descripcion}
                        </span>
                        <span className={styles.productoDetalle}>
                          <strong>{producto.cantidad}</strong> {producto.producto.unidad.descripcion}
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
                    Editar Orden
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
              <h2>Editar Orden #{ordenEditando.id_orden_venta}</h2>
              <button className={styles.closeButton} onClick={cerrarModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              
              <div className={styles.formGroup}>
                <label>Fecha Entrega Estimada:</label>
                <input
                  type="date"
                  name="fechaEntregaEstimada"
                  value={formatFechaParaInput(ordenEditando.fechaEntregaEstimada)}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Prioridad:</label>
                <select
                  name="prioridad"
                  value={ordenEditando.prioridad}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
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
                    <div className={styles.productoEditRow}>
                      <div className={styles.formGroup}>
                        <label>Producto:</label>
                        <input
                          type="text"
                          value={producto.producto.descripcion}
                          onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                          className={styles.input}
                          placeholder="Descripción del producto"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Cantidad:</label>
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                          className={styles.inputCantidad}
                          placeholder="Cantidad"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Unidad:</label>
                        <select
                          value={producto.producto.unidad.descripcion}
                          onChange={(e) => handleProductoChange(index, 'unidad', e.target.value)}
                          className={styles.selectUnidad}
                          required
                        >
                          <option value="unidades">Unidades</option>
                          <option value="kg">Kg</option>
                          <option value="litros">Litros</option>
                          <option value="cajas">Cajas</option>
                          <option value="paquetes">Paquetes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={cerrarModal}
                  disabled={guardando}
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