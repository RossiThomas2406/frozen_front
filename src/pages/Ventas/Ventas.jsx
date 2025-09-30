import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Ventas.module.css';

const Ventas = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [productosEdit, setProductosEdit] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await axios.get('https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/listar/');
        setOrdenes(response.data);
      } catch (err) {
        setError('Error al cargar las órdenes de venta');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, []);

  const formatFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleString('es-ES') : 'No asignada';
  };

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      'Pendiente de Pago': styles.badgeEstadoPendientePago,
      'Pendiente': styles.badgeEstadoPendiente,
      'Completada': styles.badgeEstadoCompletada
    };
    return clases[estado] || styles.badgeEstadoDefault;
  };

  const getPrioridadBadgeClass = (prioridad) => {
    const clases = {
      'Alta': styles.badgePrioridadAlta,
      'Media': styles.badgePrioridadMedia,
      'Baja': styles.badgePrioridadBaja
    };
    return clases[prioridad] || styles.badgePrioridadDefault;
  };

  const iniciarEdicion = (orden) => {
    setEditando(orden.id_orden_venta);
    const productosParaEditar = orden.productos ? orden.productos.map(p => ({
      id_producto: p.id_producto,
      producto: p.producto || 'Producto sin nombre',
      cantidad: p.cantidad || 0,
      unidad: p.unidad || 'unidad'
    })) : [];
    setProductosEdit(productosParaEditar);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setProductosEdit([]);
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const nuevosProductos = [...productosEdit];
    nuevosProductos[index].cantidad = Math.max(0, parseInt(nuevaCantidad) || 0);
    setProductosEdit(nuevosProductos);
  };

  const eliminarProducto = (index) => {
    setProductosEdit(productosEdit.filter((_, i) => i !== index));
  };

  const guardarCambios = async () => {
    if (!editando) return;

    try {
      setGuardando(true);
      
      const productosValidos = productosEdit
        .map(p => ({
          id_producto: parseInt(p.id_producto),
          cantidad: parseInt(p.cantidad)
        }))
        .filter(p => p.cantidad > 0);

      if (productosValidos.length === 0) {
        alert('La orden debe tener al menos un producto con cantidad mayor a 0');
        return;
      }

      const datosActualizacion = {
        id_orden_venta: editando,
        productos: productosValidos
      };

      await axios.put(
        'https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/actualizar/',
        datosActualizacion,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setOrdenes(ordenes.map(orden => 
        orden.id_orden_venta === editando 
          ? { ...orden, productos: productosEdit.filter(p => p.cantidad > 0) }
          : orden
      ));
      
      cancelarEdicion();
      alert('Orden actualizada correctamente');
      
    } catch (err) {
      const mensaje = err.response?.data ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}` : 'Error de conexión';
      alert(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>Cargando órdenes...</p>
    </div>
  );

  if (error) return (
    <div className={styles.error}>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className={styles.botonReintentar}>
        Reintentar
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Órdenes de Venta</h1>
      
      <div className={styles.ordenesList}>
        {ordenes.map((orden) => (
          <div key={orden.id_orden_venta} className={styles.ordenItem}>
            <div className={styles.ordenHeader}>
              <div className={styles.headerTop}>
                <span className={styles.ordenId}>Orden #{orden.id_orden_venta}</span>
                <div className={styles.badgesContainer}>
                  <span className={`${styles.badge} ${getEstadoBadgeClass(orden.estado_venta)}`}>
                    {orden.estado_venta}
                  </span>
                  {orden.prioridad && (
                    <span className={`${styles.badge} ${getPrioridadBadgeClass(orden.prioridad)}`}>
                      {orden.prioridad}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.headerBottom}>
                <div className={styles.clienteInfo}>
                  <span className={styles.clienteLabel}>Cliente:</span>
                  <span className={styles.clienteNombre}> {orden.cliente}</span>
                </div>
                <div className={styles.fechaInfo}>Creada: {formatFecha(orden.fecha)}</div>
              </div>
              
              {orden.fecha_entrega && (
                <div className={styles.fechaInfo}>Entrega: {formatFecha(orden.fecha_entrega)}</div>
              )}
            </div>

            <div className={styles.ordenBody}>
              {editando === orden.id_orden_venta ? (
                <div className={styles.edicionContainer}>
                  <h3>Editando Productos:</h3>
                  {productosEdit.map((producto, index) => (
                    <div key={index} className={styles.productoEdicionItem}>
                      <div className={styles.productoInfoEdit}>
                        <span className={styles.productoNombre}>{producto.producto}</span>
                        <span className={styles.productoUnidad}>({producto.unidad})</span>
                        <small>ID: {producto.id_producto}</small>
                      </div>
                      <div className={styles.controlesEdicion}>
                        <label>
                          Cantidad:
                          <input
                            type="number"
                            min="0"
                            value={producto.cantidad}
                            onChange={(e) => actualizarCantidad(index, e.target.value)}
                            className={styles.inputCantidad}
                          />
                        </label>
                        <button
                          onClick={() => eliminarProducto(index)}
                          className={styles.botonEliminar}
                          disabled={guardando}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className={styles.botonesEdicion}>
                    <button
                      onClick={guardarCambios}
                      disabled={guardando || productosEdit.length === 0}
                      className={styles.botonGuardar}
                    >
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={cancelarEdicion} className={styles.botonCancelar}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {orden.productos?.length > 0 ? (
                    <div>
                      <div className={styles.productosHeader}>
                        <h3>Productos:</h3>
                        <button onClick={() => iniciarEdicion(orden)} className={styles.botonEditar}>
                          Editar
                        </button>
                      </div>
                      <div className={styles.productosList}>
                        {orden.productos.map((producto, index) => (
                          <div key={index} className={styles.productoItem}>
                            <div className={styles.productoInfo}>
                              <span className={styles.productoNombre}>{producto.producto}</span>
                            </div>
                            <div className={styles.productoCantidad}>
                              {producto.cantidad} {producto.unidad}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.sinProductos}>
                      No hay productos
                      <button onClick={() => iniciarEdicion(orden)} className={styles.botonEditar}>
                        Editar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {ordenes.length === 0 && <div className={styles.sinOrdenes}>No hay órdenes disponibles</div>}
    </div>
  );
};

export default Ventas;