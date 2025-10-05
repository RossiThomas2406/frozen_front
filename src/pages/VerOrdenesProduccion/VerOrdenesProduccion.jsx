import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./VerOrdenesProduccion.module.css";
import OrdenProduccionService from "../../classes/DTOS/OrdenProduccionService";

const VerOrdenesProduccion = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [ordenes, setOrdenes] = useState([]);
	const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
	const [paginacion, setPaginacion] = useState(0);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(null);
	
	// Estados para las listas de filtros
	const [estadosDisponibles, setEstadosDisponibles] = useState([]);
	const [operariosDisponibles, setOperariosDisponibles] = useState([]);
	
	// Obtener filtros desde los parámetros de URL
	const [filtroProducto, setFiltroProducto] = useState(
		searchParams.get("producto") || "todos"
	);
	const [filtroEstado, setFiltroEstado] = useState(
		searchParams.get("estado") || "todos"
	);
	const [filtroOperario, setFiltroOperario] = useState(
		searchParams.get("operario") || "todos"
	);

	

	// Cargar estados y operarios al inicializar desde endpoints específicos
	useEffect(() => {
		const cargarDatosIniciales = async () => {
			try {
				console.log("Cargando estados y operarios...");
				// Obtener todos los estados desde /produccion/estados/
				// Obtener todos los operarios desde /empleados/empleados-filter/?rol=1
				const [estados, operarios] = await Promise.all([
					OrdenProduccionService.obtenerEstados(),
					OrdenProduccionService.obtenerOperarios()
				]);
				
				console.log("Estados cargados:", estados);
				console.log("Operarios cargados:", operarios);
				
				setEstadosDisponibles(estados);
				setOperariosDisponibles(operarios);
			} catch (err) {
				console.error("Error al cargar datos iniciales:", err);
				// Datos mock para testing
				console.log("Usando datos mock para testing...");
			/*	setEstadosDisponibles([
					{ id: 1, nombre: "En espera" },
					{ id: 2, nombre: "En proceso" },
					{ id: 3, nombre: "Finalizado" }
				]);
				setOperariosDisponibles([
					{ id: 1, nombre: "Juan Pérez" },
					{ id: 2, nombre: "María González" },
					{ id: 3, nombre: "Carlos López" }
				]);*/
			}
		};

		cargarDatosIniciales();
	}, []);

	useEffect(() => {
		const obtenerOrdenes = async () => {
			try {
				setCargando(true);
				setError(null);
				
				// Construir objeto de filtros para enviar al servicio
				const filtros = {
					producto: filtroProducto !== "todos" ? filtroProducto : null,
					estado: filtroEstado !== "todos" ? filtroEstado : null,
					operario: filtroOperario !== "todos" ? filtroOperario : null,
				};

				const {url, todasLasOrdenes} = await OrdenProduccionService.obtenerTodasLasOrdenes(filtros);
				console.log(todasLasOrdenes)
				setPaginacion(url);
				setOrdenes(todasLasOrdenes);
				setOrdenesFiltradas(todasLasOrdenes);
			} catch (err) {
				setError("Error al cargar las órdenes");
				console.error("Error:", err);
			} finally {
				setCargando(false);
			}
		};

		obtenerOrdenes();
	}, [filtroProducto, filtroEstado, filtroOperario]);

	async function fetchData(url) {
		const response = await fetch("https://frozenback-test.up.railway.app/api/produccion/ordenes/");
		if (!response.ok) {
			throw new Error("Error al obtener datos");
		}
		return response.json();
	}

	// Obtener productos únicos desde las órdenes (mantenemos esto porque no hay endpoint específico)
	const productosUnicos = ordenes.reduce((acc, orden) => {
		if (orden.id_producto && !acc.find(p => p.id === orden.id_producto)) {
			acc.push({ id: orden.id_producto, nombre: orden.producto });
		}
		return acc;
	}, []);
	
	// Usar estados y operarios desde los endpoints específicos
	const estadosUnicos = estadosDisponibles;
	const operariosUnicos = operariosDisponibles;
	
	// Debug logs
	console.log("estadosDisponibles:", estadosDisponibles);
	console.log("operariosDisponibles:", operariosDisponibles);
	console.log("estadosUnicos:", estadosUnicos);
	console.log("operariosUnicos:", operariosUnicos);

	// Opciones de estados con colores
	const getColorEstado = (estado) => {
		const colores = {
			"en espera": "#f39c12",
			"en proceso": "#3498db",
			finalizado: "#27ae60",
		};
		return colores[estado] || "#95a5a6";
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
			operario: filtroOperario 
		});
	};

	const manejarCambioEstado = (nuevoEstado) => {
		setFiltroEstado(nuevoEstado);
		actualizarURL({ 
			producto: filtroProducto, 
			estado: nuevoEstado, 
			operario: filtroOperario 
		});
	};

	const manejarCambioOperario = (nuevoOperario) => {
		setFiltroOperario(nuevoOperario);
		actualizarURL({ 
			producto: filtroProducto, 
			estado: filtroEstado, 
			operario: nuevoOperario 
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
		// Limpiar URL
		setSearchParams({});
	};

	if (cargando) {
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

			{/* Controles de Filtrado - Los filtros se sincronizan con la URL usando IDs */}
			{/* Ejemplos de URLs: 
				- /ordenes/?producto=3 (filtrar por producto con ID 3)
				- /ordenes/?estado=2 (filtrar por estado con ID 2)  
				- /ordenes/?operario=32 (filtrar por operario con ID 32)
				- /ordenes/?producto=3&estado=2&operario=32 (combinar múltiples filtros)
				Los valores en la URL corresponden a los IDs, no a los nombres
			*/}
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
				Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
			</div>

			{/* Lista de órdenes */}
			<div className={styles.listaOrdenes}>
				{ordenesFiltradas.length > 0 ? (
					ordenesFiltradas.map((orden) => (
						<div key={orden.Id} className={styles.cardOrden}>
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
									<span>{orden.fecha_inicio}</span>
								</div>
							</div>

							<div className={styles.cardFooter}>
								<button className={styles.btnEditar}>Editar</button>
								<button className={styles.btnEliminar}>Eliminar</button>
							</div>
						</div>
					))
				) : (
					<div className={styles.sinResultados}>
						No se encontraron órdenes con los filtros aplicados
					</div>
				)}
			</div>
		</div>
	);
};

export default VerOrdenesProduccion;
