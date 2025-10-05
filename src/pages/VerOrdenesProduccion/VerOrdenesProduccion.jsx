import React, { useState, useEffect } from "react";
import styles from "./VerOrdenesProduccion.module.css";

const VerOrdenesProduccion = () => {
	const [ordenes, setOrdenes] = useState([]);
	const [ordenesFiltradas, setOrdenesFiltradas] = useState([]);
	const [paginacion, setPaginacion] = useState(0);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState(null);
	const [filtroProducto, setFiltroProducto] = useState("todos");
	const [filtroEstado, setFiltroEstado] = useState("todos");
	const [filtroOperario, setFiltroOperario] = useState("todos");

	// Mock de datos con la nueva estructura
	const mockFetchOrdenes = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const datosMock = [
					{
						Id: 87,
						id_linea: 1,
						Estado: "en espera",
						Cantidad: 5,
						Producto: "Empanada de Carne",
						Fecha_creacion: "2025-10-01T03:30:56",
						Fecha_inicio: null,
						operario: "Carlos Rodríguez",
					},
					{
						Id: 88,
						id_linea: 2,
						Estado: "en proceso",
						Cantidad: 3,
						Producto: "Pizza Napolitana",
						Fecha_creacion: "2025-10-02T10:15:00",
						Fecha_inicio: "2025-10-02T11:00:00",
						operario: "María González",
					},
					{
						Id: 89,
						id_linea: 1,
						Estado: "finalizado",
						Cantidad: 8,
						Producto: "Empanada de Pollo",
						Fecha_creacion: "2025-10-03T08:45:00",
						Fecha_inicio: "2025-10-03T09:00:00",
						operario: "Juan Pérez",
					},
					{
						Id: 90,
						id_linea: 3,
						Estado: "en espera",
						Cantidad: 12,
						Producto: "Alfajor de Maicena",
						Fecha_creacion: "2025-10-04T14:20:00",
						Fecha_inicio: null,
						operario: "Ana López",
					},
					{
						Id: 91,
						id_linea: 2,
						Estado: "en proceso",
						Cantidad: 6,
						Producto: "Pizza Especial",
						Fecha_creacion: "2025-10-05T09:30:00",
						Fecha_inicio: "2025-10-05T10:15:00",
						operario: "Pedro Sánchez",
					},
					{
						Id: 92,
						id_linea: 1,
						Estado: "en espera",
						Cantidad: 10,
						Producto: "Empanada de Jamón y Queso",
						Fecha_creacion: "2025-10-06T16:45:00",
						Fecha_inicio: null,
						operario: "Laura Martínez",
					},
				];
				resolve(datosMock);
			}, 1000);
		});
	};

	useEffect(() => {
		const obtenerOrdenes = async () => {
			try {
				const dateishon = await fetchData()
				
				setCargando(true);
				const datos = await mockFetchOrdenes();
				setOrdenes(datos);
				setOrdenesFiltradas(datos);
				console.log(dateishon)
			} catch (err) {
				setError("Error al cargar las órdenes");
				console.error("Error:", err);
			} finally {
				setCargando(false);
			}
		};

		obtenerOrdenes();
	}, []);

	async function fetchData(url) {
		const response = await fetch("https://frozenback-test.up.railway.app/api/produccion/ordenes/");
		if (!response.ok) {
			throw new Error("Error al obtener datos");
		}
		return response.json();
	}

	// Obtener listas únicas para los filtros
	const productosUnicos = [
		"todos",
		...new Set(ordenes.map((orden) => orden.Producto)),
	];
	const estadosUnicos = [
		"todos",
		...new Set(ordenes.map((orden) => orden.Estado)),
	];
	const operariosUnicos = [
		"todos",
		...new Set(ordenes.map((orden) => orden.operario)),
	];

	// Opciones de estados con colores
	const getColorEstado = (estado) => {
		const colores = {
			"en espera": "#f39c12",
			"en proceso": "#3498db",
			finalizado: "#27ae60",
		};
		return colores[estado] || "#95a5a6";
	};

	// Aplicar filtros
	useEffect(() => {
		let resultado = [...ordenes];

		// Aplicar filtro por producto
		if (filtroProducto !== "todos") {
			resultado = resultado.filter((orden) =>
				orden.Producto.toLowerCase().includes(filtroProducto.toLowerCase())
			);
		}

		// Aplicar filtro por estado
		if (filtroEstado !== "todos") {
			resultado = resultado.filter(
				(orden) => orden.Estado.toLowerCase() === filtroEstado.toLowerCase()
			);
		}

		// Aplicar filtro por operario
		if (filtroOperario !== "todos") {
			resultado = resultado.filter((orden) =>
				orden.operario.toLowerCase().includes(filtroOperario.toLowerCase())
			);
		}

		// Ordenar por estado (en espera > en proceso > finalizado) y luego por fecha de creación
		resultado.sort((a, b) => {
			const ordenEstado = { "en espera": 3, "en proceso": 2, finalizado: 1 };
			if (ordenEstado[a.Estado] !== ordenEstado[b.Estado]) {
				return ordenEstado[b.Estado] - ordenEstado[a.Estado];
			}
			return new Date(b.Fecha_creacion) - new Date(a.Fecha_creacion);
		});

		setOrdenesFiltradas(resultado);
	}, [ordenes, filtroProducto, filtroEstado, filtroOperario]);

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

			{/* Controles de Filtrado */}
			<div className={styles.controles}>
				<div className={styles.filtroGrupo}>
					<label htmlFor="filtroProducto" className={styles.label}>
						Filtrar por Producto:
					</label>
					<select
						id="filtroProducto"
						value={filtroProducto}
						onChange={(e) => setFiltroProducto(e.target.value)}
						className={styles.select}
					>
						{productosUnicos.map((producto) => (
							<option key={producto} value={producto}>
								{producto === "todos" ? "Todos los productos" : producto}
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
						onChange={(e) => setFiltroEstado(e.target.value)}
						className={styles.select}
					>
						{estadosUnicos.map((estado) => (
							<option key={estado} value={estado}>
								{estado === "todos" ? "Todos los estados" : estado}
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
						onChange={(e) => setFiltroOperario(e.target.value)}
						className={styles.select}
					>
						{operariosUnicos.map((operario) => (
							<option key={operario} value={operario}>
								{operario === "todos" ? "Todos los operarios" : operario}
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
								<h3>Orden #{orden.Id}</h3>
								<span
									className={styles.estado}
									style={{ backgroundColor: getColorEstado(orden.Estado) }}
								>
									{orden.Estado.toUpperCase()}
								</span>
							</div>

							<div className={styles.cardBody}>
								<div className={styles.infoGrupo}>
									<strong>Producto:</strong>
									<span>{orden.Producto}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Cantidad:</strong>
									<span>{orden.Cantidad} unidades</span>
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
									<span>{formatearFecha(orden.Fecha_creacion)}</span>
								</div>

								<div className={styles.infoGrupo}>
									<strong>Iniciada:</strong>
									<span>{formatearFecha(orden.Fecha_inicio)}</span>
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
