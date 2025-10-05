import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Ventas.module.css';

const Ventas = () => {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [productosEdit, setProductosEdit] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ id_producto: '', cantidad: 1 });
  const [fechaEntregaEdit, setFechaEntregaEdit] = useState('');
  const [prioridadEdit, setPrioridadEdit] = useState('');

  // Función para navegar a crear nueva orden
  const handleCrearNuevaOrden = () => {
    navigate('/crearOrdenVenta');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [ordenesResponse, productosResponse, prioridadesResponse] = await Promise.all([
          axios.get('https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/listar/'),
          axios.get('https://frozenback-test.up.railway.app/api/productos/productos/'),
          axios.get('https://frozenback-test.up.railway.app/api/ventas/prioridades/')
        ]);
        
        setOrdenes(ordenesResponse.data);
        setProductosDisponibles(productosResponse.data.results || []);
        setPrioridades(prioridadesResponse.data.results || []);
        
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatFecha = (fecha) => {
    if (!fecha) return 'No asignada';
    
    try {
      const fechaISO = fecha.replace(' ', 'T');
      return new Date(fechaISO).toLocaleString('es-ES');
    } catch (error) {
      console.warn('Error formateando fecha:', fecha, error);
      return 'Fecha inválida';
    }
  };

  // Función para formatear fecha para input datetime-local
  const formatFechaParaInput = (fecha) => {
    if (!fecha) return '';
    try {
      const fechaObj = new Date(fecha.replace(' ', 'T'));
      return fechaObj.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  };

  // Función para obtener la descripción de la prioridad por ID
  const getDescripcionPrioridad = (idPrioridad) => {
    const prioridad = prioridades.find(p => p.id_prioridad === idPrioridad);
    return prioridad ? prioridad.descripcion : '';
  };

  // Función para obtener el ID de la prioridad por descripción
  const getIdPrioridad = (descripcion) => {
    const prioridad = prioridades.find(p => p.descripcion === descripcion);
    return prioridad ? prioridad.id_prioridad : null;
  };

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      'Pendiente de Pago': styles.badgeEstadoPendientePago,
      'Pendiente': styles.badgeEstadoPendiente,
      'En Preparación': styles.badgeEstadoPreparacion,
      'Completada': styles.badgeEstadoCompletada
    };
    return clases[estado] || styles.badgeEstadoDefault;
  };

  const getPrioridadBadgeClass = (prioridad) => {
    const clases = {
      'Urgente': styles.badgePrioridadUrgente,
      'Alta': styles.badgePrioridadAlta,
      'Media': styles.badgePrioridadMedia,
      'Baja': styles.badgePrioridadBaja
    };
    return clases[prioridad] || styles.badgePrioridadDefault;
  };

  const iniciarEdicion = (orden) => {
    setEditando(orden.id_orden_venta);
    
    // Agregar un id único temporal para cada producto
    const productosParaEditar = (orden.productos || []).map((p, index) => ({
      id_producto: p.id_producto,
      producto: p.producto || 'Producto sin nombre',
      cantidad: p.cantidad || 0,
      unidad: p.unidad || 'unidad',
      tipo: p.tipo || '',
      tempId: `${p.id_producto}-${Date.now()}-${index}`
    }));
    
    setProductosEdit(productosParaEditar);
    setFechaEntregaEdit(formatFechaParaInput(orden.fecha_entrega));
    
    // Buscar el ID de prioridad basado en la descripción de la orden
    const prioridadEncontrada = prioridades.find(p => p.descripcion === orden.prioridad);
    setPrioridadEdit(prioridadEncontrada ? prioridadEncontrada.id_prioridad.toString() : '');
    
    setNuevoProducto({ id_producto: '', cantidad: 1 });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setProductosEdit([]);
    setFechaEntregaEdit('');
    setPrioridadEdit('');
    setNuevoProducto({ id_producto: '', cantidad: 1 });
  };

  const actualizarCantidad = (tempId, nuevaCantidad) => {
    const nuevosProductos = productosEdit.map(producto =>
      producto.tempId === tempId
        ? { ...producto, cantidad: Math.max(0, parseInt(nuevaCantidad) || 0) }
        : producto
    );
    setProductosEdit(nuevosProductos);
  };

  const eliminarProducto = (tempId) => {
    setProductosEdit(productosEdit.filter(producto => producto.tempId !== tempId));
  };

  // Obtener productos disponibles que NO están ya en la orden
  const getProductosDisponiblesParaAgregar = () => {
    const productosEnOrden = productosEdit.map(p => p.id_producto);
    return productosDisponibles.filter(
      producto => !productosEnOrden.includes(producto.id_producto)
    );
  };

  const agregarProducto = () => {
    if (!nuevoProducto.id_producto) {
      alert('Por favor selecciona un producto');
      return;
    }

    const productoSeleccionado = productosDisponibles.find(
      p => p.id_producto === parseInt(nuevoProducto.id_producto)
    );

    if (!productoSeleccionado) {
      alert('Producto no encontrado');
      return;
    }

    // Verificar que el producto no esté ya en la lista (doble verificación)
    const yaExiste = productosEdit.some(
      p => p.id_producto === productoSeleccionado.id_producto
    );

    if (yaExiste) {
      alert('Este producto ya está en la orden');
      return;
    }

    const nuevoProductoEnOrden = {
      id_producto: productoSeleccionado.id_producto,
      producto: productoSeleccionado.nombre || 'Producto sin nombre',
      cantidad: Math.max(1, parseInt(nuevoProducto.cantidad) || 1),
      unidad: productoSeleccionado.unidad?.descripcion || 'unidad',
      tipo: productoSeleccionado.tipo_producto?.descripcion || '',
      tempId: `${productoSeleccionado.id_producto}-${Date.now()}-${Math.random()}`
    };

    setProductosEdit([...productosEdit, nuevoProductoEnOrden]);
    setNuevoProducto({ id_producto: '', cantidad: 1 });
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

      // Preparar datos para la actualización
      const datosActualizacion = {
        id_orden_venta: editando,
        productos: productosValidos
      };

      // Agregar fecha_entrega si se modificó
      if (fechaEntregaEdit) {
        const fechaObj = new Date(fechaEntregaEdit);
        const fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');
        datosActualizacion.fecha_entrega = fechaFormateada;
      } else {
        datosActualizacion.fecha_entrega = null;
      }

      // Agregar id_prioridad si se seleccionó
      if (prioridadEdit) {
        datosActualizacion.id_prioridad = parseInt(prioridadEdit);
      }

      await axios.put(
        'https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/actualizar/',
        datosActualizacion,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Actualizar el estado local
      setOrdenes(ordenes.map(orden => 
        orden.id_orden_venta === editando 
          ? { 
              ...orden, 
              productos: productosEdit
                .filter(p => p.cantidad > 0)
                .map(p => ({
                  id_producto: p.id_producto,
                  producto: p.producto,
                  cantidad: p.cantidad,
                  unidad: p.unidad,
                  tipo: p.tipo
                })),
              fecha_entrega: fechaEntregaEdit 
                ? new Date(fechaEntregaEdit).toISOString().slice(0, 19).replace('T', ' ')
                : null,
              prioridad: getDescripcionPrioridad(parseInt(prioridadEdit)) || orden.prioridad
            }
          : orden
      ));
      
      cancelarEdicion();
      alert('Orden actualizada correctamente');
      
    } catch (err) {
      const mensaje = err.response?.data 
        ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}` 
        : 'Error de conexión';
      alert(mensaje);
      console.error('Error guardando cambios:', err);
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
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Órdenes de Venta</h1>
        <button 
          onClick={handleCrearNuevaOrden}
          className={styles.botonCrearOrden}
        >
          Crear Nueva Orden
        </button>
      </div>
      
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
              
              <div className={styles.fechaEntregaInfo}>
                <span className={styles.fechaEntregaLabel}>Entrega estimada:</span>
                <span className={styles.fechaEntregaValor}> {formatFecha(orden.fecha_entrega)}</span>
              </div>
            </div>

            <div className={styles.ordenBody}>
              {editando === orden.id_orden_venta ? (
                <div className={styles.edicionContainer}>
                  {/* Sección para editar prioridad */}
                  <div className={styles.prioridadEdicion}>
                    <h4>Prioridad:</h4>
                    <div className={styles.inputGrupo}>
                      <label htmlFor={`prioridad-${orden.id_orden_venta}`}>
                        Nivel de Prioridad:
                      </label>
                      <select
                        id={`prioridad-${orden.id_orden_venta}`}
                        value={prioridadEdit}
                        onChange={(e) => setPrioridadEdit(e.target.value)}
                        className={styles.selectPrioridad}
                      >
                        <option value="">Seleccionar prioridad</option>
                        {prioridades.map(prioridad => (
                          <option 
                            key={prioridad.id_prioridad} 
                            value={prioridad.id_prioridad}
                          >
                            {prioridad.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sección para editar fecha de entrega */}
                  <div className={styles.fechaEntregaEdicion}>
                    <h4>Fecha de Entrega Estimada:</h4>
                    <div className={styles.inputGrupo}>
                      <label htmlFor={`fecha-entrega-${orden.id_orden_venta}`}>
                        Fecha y Hora de Entrega:
                      </label>
                      <input
                        id={`fecha-entrega-${orden.id_orden_venta}`}
                        type="datetime-local"
                        value={fechaEntregaEdit}
                        onChange={(e) => setFechaEntregaEdit(e.target.value)}
                        className={styles.inputFecha}
                      />
                      <button
                        type="button"
                        onClick={() => setFechaEntregaEdit('')}
                        className={styles.botonLimpiarFecha}
                        title="Eliminar fecha de entrega"
                      >
                        ×
                      </button>
                    </div>
                    <small className={styles.fechaHelp}>
                      Dejar vacío si no hay fecha de entrega estimada
                    </small>
                  </div>

                  <h3>Productos:</h3>
                  
                  {/* Lista de productos actuales */}
                  {productosEdit.length > 0 ? (
                    productosEdit.map((producto) => (
                      <div key={producto.tempId} className={styles.productoEdicionItem}>
                        <div className={styles.productoInfoEdit}>
                          <span className={styles.productoNombre}>{producto.producto}</span>
                          <span className={styles.productoUnidad}>({producto.unidad})</span>
                        </div>
                        <div className={styles.controlesEdicion}>
                          <label>
                            Cantidad:
                            <input
                              type="number"
                              min="0"
                              value={producto.cantidad}
                              onChange={(e) => actualizarCantidad(producto.tempId, e.target.value)}
                              className={styles.inputCantidad}
                            />
                          </label>
                          <button
                            onClick={() => eliminarProducto(producto.tempId)}
                            className={styles.botonEliminar}
                            disabled={guardando}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.sinProductosMsg}>No hay productos en la orden</p>
                  )}
                  
                  {/* Formulario para agregar nuevo producto */}
                  <div className={styles.agregarProductoContainer}>
                    <h4>Agregar Producto:</h4>
                    <div className={styles.formAgregarProducto}>
                      <select
                        value={nuevoProducto.id_producto}
                        onChange={(e) => setNuevoProducto({
                          ...nuevoProducto,
                          id_producto: e.target.value
                        })}
                        className={styles.selectProducto}
                      >
                        <option value="">Seleccionar producto</option>
                        {getProductosDisponiblesParaAgregar().map(producto => (
                          <option 
                            key={producto.id_producto} 
                            value={producto.id_producto}
                          >
                            {producto.nombre} ({producto.unidad?.descripcion})
                          </option>
                        ))}
                      </select>
                      
                      <label className={styles.labelCantidad}>
                        Cantidad:
                        <input
                          type="number"
                          min="1"
                          value={nuevoProducto.cantidad}
                          onChange={(e) => setNuevoProducto({
                            ...nuevoProducto,
                            cantidad: e.target.value
                          })}
                          className={styles.inputCantidadNuevo}
                        />
                      </label>
                      
                      <button
                        onClick={agregarProducto}
                        disabled={!nuevoProducto.id_producto || guardando}
                        className={styles.botonAgregar}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.botonesEdicion}>
                    <button
                      onClick={guardarCambios}
                      disabled={guardando || productosEdit.filter(p => p.cantidad > 0).length === 0}
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
                  {(orden.productos && orden.productos.length > 0) ? (
                    <div>
                      <div className={styles.productosHeader}>
                        <h3>Productos:</h3>
                        <button onClick={() => iniciarEdicion(orden)} className={styles.botonEditar}>
                          Editar
                        </button>
                      </div>
                      <div className={styles.productosList}>
                        {orden.productos.map((producto, index) => (
                          <div key={`${producto.id_producto}-${index}`} className={styles.productoItem}>
                            <div className={styles.productoInfo}>
                              <span className={styles.productoNombre}>{producto.producto}</span>
                              <span className={styles.productoTipo}>({producto.tipo})</span>
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
                      <span>No hay productos</span>
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