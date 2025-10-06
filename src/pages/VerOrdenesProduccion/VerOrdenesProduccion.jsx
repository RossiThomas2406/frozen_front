import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from 'react-modal';
import styles from "./VerOrdenesProduccion.module.css";
import OrdenProduccionService from "../../classes/DTOS/OrdenProduccionService";

// Configurar el modal para accesibilidad
Modal.setAppElement('#root');

const VerOrdenesProduccion = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [ordenes, setOrdenes] = useState([]);
	const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(null);

	// Estados para paginación
	const [paginacion, setPaginacion] = useState({
		currentPage: 1,
		totalPages: 1,
		count: 0,
		next: null,
		previous: null,
		pageSize: 10
	});

	// Estados para las listas de filtros
	const [estadosDisponibles, setEstadosDisponibles] = useState([]);
	const [operariosDisponibles, setOperariosDisponibles] = useState([]);

	// Estados para el modal de cancelación
	const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
	const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
	const [razonCancelacion, setRazonCancelacion] = useState("");
	const [cancelando, setCancelando] = useState(false);

	// Obtener filtros desde los parámetros de URL
	const [filtroProducto, setFiltroProducto] = useState("todos");
	const [filtroEstado, setFiltroEstado] = useState("todos");
	const [filtroOperario, setFiltroOperario] = useState("todos");

	// Cargar estados y operarios al inicializar desde endpoints específicos
	useEffect(() => {
		const cargarDatosIniciales = async () => {
			try {
				const [estados, operarios] = await Promise.all([
					OrdenProduccionService.obtenerEstados(),
					OrdenProduccionService.obtenerOperarios(),
				]);

				setEstadosDisponibles(estados);
				setOperariosDisponibles(operarios);
			} catch (err) {
				console.error("Error al cargar datos iniciales:", err);
			}
		};

		cargarDatosIniciales();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			await obtenerOrdenes(1);
		};
		fetchData();
	}, [filtroProducto, filtroEstado, filtroOperario]);

	const obtenerOrdenes = async (page = 1) => {
		try {
			setCargando(true);
			setError(null);

			const filtros = {
				producto: filtroProducto !== "todos" ? filtroProducto : null,
				estado: filtroEstado !== "todos" ? filtroEstado : null,
				operario: filtroOperario !== "todos" ? filtroOperario : null,
			};

			const response = await OrdenProduccionService.obtenerOrdenesPaginated(page, filtros);
			
			setOrdenes(response.ordenes);
			setOrdenesFiltradas(response.ordenes);
			setPaginacion({
				currentPage: page,
				totalPages: Math.ceil(response.paginacion.count / 10),
				count: response.paginacion.count,
				next: response.paginacion.next,
				previous: response.paginacion.previous,
				pageSize: 10
			});
		} catch (err) {
			setError("Error al cargar las órdenes");
			console.error("Error:", err);
		} finally {
			setCargando(false);
		}
	};

	// Función para cambiar de página
	const cambiarPagina = async (nuevaPagina) => {
		if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPages) {
			await obtenerOrdenes(nuevaPagina);
		}
	};

	// Obtener productos únicos desde las órdenes
	const productosUnicos = ordenes.reduce((acc, orden) => {
		if (orden.id_producto && !acc.find((p) => p.id === orden.id_producto)) {
			acc.push({ id: orden.id_producto, nombre: orden.producto });
		}
		return acc;
	}, []);

	// Usar estados y operarios desde los endpoints específicos
	const estadosUnicos = estadosDisponibles;
	const operariosUnicos = operariosDisponibles;

	// Opciones de estados con colores
	const getColorEstado = (estado) => {
		const colores = {
			"en espera": "#f39c12",
			"en proceso": "#3498db",
			finalizado: "#27ae60",
			"Pendiente de inicio": "#f39c12",
			"En proceso": "#3498db",
			"Finalizada": "#27ae60",
			"Cancelado": "#e74c3c"
		};
		return colores[estado] || "#95a5a6";
	};

	const manejarIniciarOrden = async (idOrden) => {
		try {
			const response = await fetch(
				`https://frozenback-test.up.railway.app/api/produccion/ordenes/${idOrden}/actualizar_estado/`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id_estado_orden_produccion: 4 }), // 4 = En proceso
				}
			);

			if (!response.ok) {
				throw new Error(`Error HTTP: ${response.status}`);
			}

			await obtenerOrdenes(paginacion.currentPage);

		} catch (error) {
			console.error("Error al actualizar la orden:", error);
		}
	};

	// Función para abrir el modal de cancelación
	const abrirModalCancelar = (orden) => {
		setOrdenSeleccionada(orden);
		setRazonCancelacion("");
		setModalCancelarAbierto(true);
	};

	// Función para cerrar el modal de cancelación
	const cerrarModalCancelar = () => {
		setModalCancelarAbierto(false);
		setOrdenSeleccionada(null);
		setRazonCancelacion("");
		setCancelando(false);
	};

	// Función para manejar la cancelación de la orden
	const manejarCancelarOrden = async () => {
		if (!razonCancelacion.trim()) {
			alert("Por favor, ingresa una razón para la cancelación");
			return;
		}

		setCancelando(true);
		try {
			// Aquí iría la llamada al backend cuando tengas el endpoint
			console.log("Cancelando orden:", {
				ordenId: ordenSeleccionada.id,
				razon: razonCancelacion,
				fecha: new Date().toISOString()
			});

			// Simular llamada API
			await new Promise(resolve => setTimeout(resolve, 1500));

			// En un caso real, aquí harías:
			// const response = await fetch(`/api/produccion/ordenes/${ordenSeleccionada.id}/cancelar/`, {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ razon: razonCancelacion })
			// });

			alert(`Orden #${ordenSeleccionada.id} cancelada exitosamente\nRazón: ${razonCancelacion}`);
			
			// Recargar las órdenes para reflejar el cambio
			await obtenerOrdenes(paginacion.currentPage);
			
			cerrarModalCancelar();
			
		} catch (error) {
			console.error("Error al cancelar la orden:", error);
			alert("Error al cancelar la orden. Por favor, intenta nuevamente.");
		} finally {
			setCancelando(false);
		}
	};

	// Función para actualizar la URL con los filtros
	const actualizarURL = (nuevosFiltros) => {
		const params = new URLSearchParams();

		if (nuevosFiltros.producto && nuevosFiltros.producto !== "todos") {
			params.set("producto", nuevosFiltros.producto);
		}
		if (nuevosFiltros.estado && nuevosFiltros.estado !== "todos") {
			params.set("estado", nuevosFiltros.estado);
		}
		if (nuevosFiltros.operario && nuevosFiltros.operario !== "todos") {
			params.set("operario", nuevosFiltros.operario);
		}

		setSearchParams(params);
	};

	// Funciones para manejar cambios en los filtros
	const manejarCambioProducto = (nuevoProducto) => {
		setFiltroProducto(nuevoProducto);
		actualizarURL({
			producto: nuevoProducto,
			estado: filtroEstado,
			operario: filtroOperario,
		});
	};

	const manejarCambioEstado = (nuevoEstado) => {
		setFiltroEstado(nuevoEstado);
		actualizarURL({
			producto: filtroProducto,
			estado: nuevoEstado,
			operario: filtroOperario,
		});
	};

	const manejarCambioOperario = (nuevoOperario) => {
		setFiltroOperario(nuevoOperario);
		actualizarURL({
			producto: filtroProducto,
			estado: filtroEstado,
			operario: nuevoOperario,
		});
	};

	const formatearFecha = (fechaISO) => {
		if (!fechaISO) return "No iniciada";
		const fecha = new Date(fechaISO);
		return `${fecha.getDate()}/${
			fecha.getMonth() + 1
		}/${fecha.getFullYear()}, ${fecha.getHours()}:${fecha
			.getMinutes()
			.toString()
			.padStart(2, "0")}`;
	};

	const limpiarFiltros = () => {
		setFiltroProducto("todos");
		setFiltroEstado("todos");
		setFiltroOperario("todos");
		setSearchParams({});
	};

	// Generar array de páginas para mostrar en la paginación
	const generarNumerosPagina = () => {
		const paginas = [];
		const paginaActual = paginacion.currentPage;
		const totalPaginas = paginacion.totalPages;

		let inicio = Math.max(1, paginaActual - 2);
		let fin = Math.min(totalPaginas, paginaActual + 2);

		if (paginaActual <= 3) {
			fin = Math.min(5, totalPaginas);
		}
		if (paginaActual >= totalPaginas - 2) {
			inicio = Math.max(1, totalPaginas - 4);
		}

		for (let i = inicio; i <= fin; i++) {
			paginas.push(i);
		}

		return paginas;
	};

	if (cargando && ordenes.length === 0) {
		return (
			<div className={styles.cargando}>Cargando órdenes de producción...</div>
		);
	}

	if (error) {
		return <div className={styles.error}>{error}</div>;
	}

	return (
		<div className={styles.verOrdenesProduccion}>
			<h2 className={styles.titulo}>Órdenes de Producción</h2>

			{/* Controles de Filtrado */}
			<div className={styles.controles}>
				<div className={styles.filtroGrupo}>
					<label htmlFor="filtroProducto" className={styles.label}>
						Filtrar por Producto:
					</label>
					<select
						id="filtroProducto"
						value={filtroProducto}
						onChange={(e) => manejarCambioProducto(e.target.value)}
						className={styles.select}
					>
						<option value="todos">Todos los productos</option>
						{productosUnicos.map((producto) => (
							<option key={producto.id} value={producto.id}>
								{producto.nombre}
							</option>
						))}
					</select>
				</div>

				<div className={styles.filtroGrupo}>
					<label htmlFor="filtroEstado" className={styles.label}>
						Filtrar por Estado:
					</label>
					<select
						id="filtroEstado"
						value={filtroEstado}
						onChange={(e) => manejarCambioEstado(e.target.value)}
						className={styles.select}
					>
						<option value="todos">Todos los estados</option>
						{estadosUnicos.map((estado) => (
							<option key={estado.id} value={estado.id}>
								{estado.nombre}
							</option>
						))}
					</select>
				</div>

				<div className={styles.filtroGrupo}>
					<label htmlFor="filtroOperario" className={styles.label}>
						Filtrar por Operario:
					</label>
					<select
						id="filtroOperario"
						value={filtroOperario}
						onChange={(e) => manejarCambioOperario(e.target.value)}
						className={styles.select}
					>
						<option value="todos">Todos los operarios</option>
						{operariosUnicos.map((operario) => (
							<option key={operario.id} value={operario.id}>
								{operario.nombre}
							</option>
						))}
					</select>
				</div>

				<button onClick={limpiarFiltros} className={styles.btnLimpiar}>
					Limpiar Filtros
				</button>
			</div>

			{/* Contador de resultados */}
			<div className={styles.contador}>
				Mostrando {ordenesFiltradas.length} de {paginacion.count} órdenes 
				{paginacion.totalPages > 1 && ` (Página ${paginacion.currentPage} de ${paginacion.totalPages})`}
			</div>

			{/* Lista de órdenes */}
			<div className={styles.listaOrdenes}>
				{ordenesFiltradas.length > 0 ? (
					ordenesFiltradas.map((orden) => (
						<div key={orden.id} className={styles.cardOrden}>
							<div className={styles.cardHeader}>
								<h3>Orden #{orden.id}</h3>
								<span
									className={styles.estado}
									style={{ backgroundColor: getColorEstado(orden.estado) }}
								>
									{orden.estado.toUpperCase()}
								</span>
							</div>

							<div className={styles.cardBody}>
								<div className={styles.infoGrupo}>
									<strong>Producto:</strong>
									<span>{orden.producto}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Cantidad:</strong>
									<span>{orden.cantidad} unidades</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Línea:</strong>
									<span>#{orden.id_linea}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Operario:</strong>
									<span>{orden.operario}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Creada:</strong>
									<span>{formatearFecha(orden.fecha_creacion)}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Iniciada:</strong>
									<span>{formatearFecha(orden.fecha_inicio)}</span>
								</div>
							</div>

							<div className={styles.cardFooter}>
								{orden.estado === "Pendiente de inicio" ? (
									<button
										className={styles.btnIniciar}
										onClick={() => manejarIniciarOrden(orden.id)}
									>
										Iniciar
									</button>
								) : null}

								{orden.estado === "En proceso" ? (
									<>
										<button className={styles.btnFinalizar}>Finalizar</button>
										<button 
											className={styles.btnCancelar}
											onClick={() => abrirModalCancelar(orden)}
										>
											Cancelar
										</button>
									</>
								) : null}

								{orden.estado === "Finalizada" ? (
									<>
										<button className={styles.btnDesperdicio}>
											Desperdicio
										</button>
										<button className={styles.btnControlCalidad}>
											Control de Calidad
										</button>
									</>
								) : null}
							</div>
						</div>
					))
				) : (
					<div className={styles.sinResultados}>
						No se encontraron órdenes con los filtros aplicados
					</div>
				)}
			</div>

			{/* Paginación */}
			{paginacion.totalPages > 1 && (
				<div className={styles.paginacion}>
					<button
						className={`${styles.btnPagina} ${styles.btnPaginaAnterior}`}
						onClick={() => cambiarPagina(paginacion.currentPage - 1)}
						disabled={!paginacion.previous}
					>
						‹ Anterior
					</button>

					{generarNumerosPagina().map((numero) => (
						<button
							key={numero}
							className={`${styles.btnPagina} ${
								numero === paginacion.currentPage ? styles.btnPaginaActiva : ""
							}`}
							onClick={() => cambiarPagina(numero)}
						>
							{numero}
						</button>
					))}

					<button
						className={`${styles.btnPagina} ${styles.btnPaginaSiguiente}`}
						onClick={() => cambiarPagina(paginacion.currentPage + 1)}
						disabled={!paginacion.next}
					>
						Siguiente ›
					</button>
				</div>
			)}

			{/* Modal de Cancelación */}
			<Modal
				isOpen={modalCancelarAbierto}
				onRequestClose={cerrarModalCancelar}
				className={styles.modal}
				overlayClassName={styles.overlay}
				contentLabel="Cancelar Orden de Producción"
			>
				<div className={styles.modalContent}>
					<h2 className={styles.modalTitulo}>Cancelar Orden de Producción</h2>
					
					{ordenSeleccionada && (
						<div className={styles.modalInfo}>
							<p><strong>Orden #:</strong> {ordenSeleccionada.id}</p>
							<p><strong>Producto:</strong> {ordenSeleccionada.producto}</p>
							<p><strong>Cantidad:</strong> {ordenSeleccionada.cantidad} unidades</p>
						</div>
					)}

					<div className={styles.modalForm}>
						<label htmlFor="razonCancelacion" className={styles.modalLabel}>
							Razón de Cancelación *
						</label>
						<textarea
							id="razonCancelacion"
							value={razonCancelacion}
							onChange={(e) => setRazonCancelacion(e.target.value)}
							className={styles.modalTextarea}
							placeholder="Describe la razón por la cual se cancela esta orden de producción..."
							rows={5}
							required
						/>
						<small className={styles.modalHelp}>
							Este registro será guardado para auditoría y seguimiento.
						</small>
					</div>

					<div className={styles.modalActions}>
						<button
							onClick={cerrarModalCancelar}
							className={styles.btnModalCancelar}
							disabled={cancelando}
						>
							Volver
						</button>
						<button
							onClick={manejarCancelarOrden}
							className={styles.btnModalConfirmar}
							disabled={cancelando || !razonCancelacion.trim()}
						>
							{cancelando ? (
								<>
									<div className={styles.spinnerSmall}></div>
									Cancelando...
								</>
							) : (
								'Confirmar Cancelación'
							)}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default VerOrdenesProduccion;