import React from "react";
import axios from "axios";
import styles from "./CrearOrdenDeVenta.module.css";
import { useState, useEffect } from "react";

// Configuración base de axios
const api = axios.create({
  baseURL: "https://frozenback-test.up.railway.app/api",
  timeout: 10000,
});

function CrearOrdenDeVenta() {
	const [cantidadElementos, setCantidadElementos] = useState(1);
	const [clientes, setClientes] = useState([]);
	const [products, setProducts] = useState([]);
	const [prioridades, setPrioridades] = useState([]);
	const [loading, setLoading] = useState(true);
	const [creatingOrder, setCreatingOrder] = useState(false); // Nuevo estado para crear orden
	const [fields, setFields] = useState([
		{ id: "1", id_producto: "", cantidad: 1, unidad_medida: "" },
	]);
	const [orden, setOrden] = useState({
		id_cliente: "",
		id_prioridad: "",
		fecha_entrega: "",
		productos: [],
	});
	const [errors, setErrors] = useState({
		cliente: "",
		prioridad: "",
		fecha_entrega: "",
		productos: "",
	});

	useEffect(() => {
		const fetchApis = async () => {
			try {
				const [clientesResponse, productosResponse, prioridadesResponse] = await Promise.all([
					obtenerClientes(),
					obtenerProductos(),
					obtenerPrioridades()
				]);

				setProducts(productosResponse.data.results);
				setClientes(clientesResponse.data.results);
				setPrioridades(prioridadesResponse.data.results);
				setLoading(false);
			} catch (error) {
				console.error("Error cargando datos:", error);
				setLoading(false);
			}
		};

		fetchApis();
	}, []);

	const obtenerProductos = async () => {
		return await api.get("/productos/listar/");
	};

	const obtenerClientes = async () => {
		return await api.get("/ventas/clientes/");
	};

	const obtenerPrioridades = async () => {
		return await api.get("/ventas/prioridades/");
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setOrden({
			...orden,
			[name]: value,
		});
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: "",
			});
		}
	};

	const addField = () => {
		setCantidadElementos(cantidadElementos + 1);
		const newField = {
			id: Date.now().toString(),
			id_producto: "",
			cantidad: 1,
			unidad_medida: "",
		};
		setFields([...fields, newField]);
	};

	const removeField = (id) => {
		setCantidadElementos(cantidadElementos - 1);
		if (fields.length > 1) {
			setFields(fields.filter((field) => field.id !== id));
		}
	};

	const updateProduct = (id, id_producto) => {
		const productoYaSeleccionado = fields.some(
			(field) => field.id !== id && field.id_producto === id_producto
		);

		if (productoYaSeleccionado && id_producto !== "") {
			alert(
				"Este producto ya ha sido seleccionado. Por favor, elige otro producto."
			);
			return;
		}

		// Encontrar el producto seleccionado para obtener su unidad de medida
		const productoSeleccionado = products.find(product => product.id_producto === parseInt(id_producto));
		const unidadMedida = productoSeleccionado ? productoSeleccionado.unidad_medida : "";

		setFields(
			fields.map((field) =>
				field.id === id ? { 
					...field, 
					id_producto, 
					unidad_medida: unidadMedida 
				} : field
			)
		);

		if (errors.productos) {
			setErrors({
				...errors,
				productos: "",
			});
		}
	};

	const updateQuantity = (id, cantidad) => {
		setFields(
			fields.map((field) =>
				field.id === id ? { ...field, cantidad: Math.max(1, cantidad) } : field
			)
		);
	};

	/* VALIDACIONES */
	const validarFormulario = () => {
		setErrors({
			cliente: "",
			prioridad: "",
			fecha_entrega: "",
			productos: "",
		});

		const nuevosErrores = {
			cliente: "",
			prioridad: "",
			fecha_entrega: "",
			productos: "",
		};

		let esValido = true;

		// Validar cliente
		if (!orden.id_cliente || orden.id_cliente === "") {
			nuevosErrores.cliente = "Debes seleccionar un cliente";
			esValido = false;
		}

		// Validar prioridad
		if (!orden.id_prioridad || orden.id_prioridad === "") {
			nuevosErrores.prioridad = "Debes seleccionar una prioridad";
			esValido = false;
		}

		// Validar fecha de entrega
		if (!orden.fecha_entrega) {
			nuevosErrores.fecha_entrega = "Debes indicar una fecha de entrega";
			esValido = false;
		} else {
			const hoy = new Date();
			hoy.setHours(0, 0, 0, 0);
			const fechaEntrega = new Date(orden.fecha_entrega);
			const diferenciaDias = Math.ceil(
				(fechaEntrega - hoy) / (1000 * 60 * 60 * 24)
			);

			if (diferenciaDias < 3) {
				nuevosErrores.fecha_entrega =
					"La fecha de entrega debe ser al menos 3 días mayor a la fecha actual";
				esValido = false;
			}
		}

		// Validar productos
		const productosSeleccionados = fields.filter(
			(field) => field.id_producto !== ""
		);
		if (productosSeleccionados.length === 0) {
			nuevosErrores.productos = "Debes seleccionar al menos un producto";
			esValido = false;
		}

		const idsProductos = fields
			.filter((field) => field.id_producto !== "")
			.map((field) => field.id_producto);
		const productosUnicos = new Set(idsProductos);

		if (idsProductos.length !== fields.length) {
			nuevosErrores.productos = "No puedes dejar productos sin seleccionar";
			esValido = false;
		}

		if (idsProductos.length !== productosUnicos.size) {
			nuevosErrores.productos =
				"No puedes seleccionar el mismo producto más de una vez";
			esValido = false;
		}

		setErrors(nuevosErrores);
		return esValido;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const productosConIdDinamico = [...fields];
		let productos = agregarSinId(productosConIdDinamico);
		const nuevaOrden = { ...orden, productos: productos };
		
		if (!validarFormulario()) {
			return;
		}
		
		setCreatingOrder(true); // Iniciar estado de carga
		
		try {
			const response = await api.post("/ventas/ordenes-venta/crear/", nuevaOrden);

			if (response.status === 200 || response.status === 201) {
				console.log("Orden de venta creada:", response.data);
				// Reiniciar el formulario
				setOrden({
					id_cliente: "",
					id_prioridad: "",
					fecha_entrega: "",
					productos: [],
				});
				setFields([{ id: "1", id_producto: "", cantidad: 1, unidad_medida: "" }]);
				setErrors({
					cliente: "",
					prioridad: "",
					fecha_entrega: "",
					productos: "",
				});
				alert("Orden de venta creada exitosamente");
			}
		} catch (error) {
			console.error("Error al crear orden:", error);
			if (error.response) {
				// El servidor respondió con un código de error
				console.error("Detalles del error:", error.response.data);
				alert(`Error al crear la orden: ${error.response.status} - ${error.response.data.message || 'Error del servidor'}`);
			} else if (error.request) {
				// La petición fue hecha pero no se recibió respuesta
				alert("Error de conexión: No se pudo contactar al servidor");
			} else {
				// Algo pasó en la configuración de la petición
				alert("Error inesperado al crear la orden");
			}
		} finally {
			setCreatingOrder(false); // Finalizar estado de carga
		}
	};

	function agregarSinId(arrayOrigen) {
		const sinId = arrayOrigen.map(({ id, ...resto }) => resto);
		return sinId;
	}

	const obtenerFechaMinima = () => {
		const fecha = new Date();
		fecha.setDate(fecha.getDate() + 3);
		return fecha.toISOString().split("T")[0];
	};

	const isProductoSeleccionado = (id_producto, currentFieldId) => {
		return fields.some(
			(field) =>
				field.id !== currentFieldId && field.id_producto === id_producto
		);
	};

	// Función para obtener la unidad de medida de un producto
	const obtenerUnidadMedida = (id_producto) => {
		const producto = products.find(p => p.id_producto === parseInt(id_producto));
		return producto ? producto.unidad_medida : "";
	};

	if (loading) {
		return (
			<div className={styles.loading}>
				<div className={styles.spinner}></div>
				<p>Cargando datos...</p>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Crear Orden de Venta</h1>
			<div className="divFormulario">
				<form onSubmit={handleSubmit}>
					<div className={styles.formGrid}>
						{/* Cliente */}
						<div className={styles.formGroup}>
							<label htmlFor="Cliente" className={styles.formLabel}>
								Cliente:
							</label>
							<select
								name="id_cliente"
								id="Cliente"
								value={orden.id_cliente}
								onChange={handleChange}
								disabled={creatingOrder}
								className={`${styles.formInput} ${
									errors.cliente ? styles.inputError : ""
								} ${creatingOrder ? styles.disabledInput : ''}`}
							>
								<option value="" disabled hidden>
									Seleccione una opción
								</option>
								{clientes.map((cliente) => (
									<option key={cliente.id_cliente} value={cliente.id_cliente}>
										{cliente.nombre}
									</option>
								))}
							</select>
							{errors.cliente && (
								<span className={styles.errorText}>
									{errors.cliente}
								</span>
							)}
						</div>

						{/* Fecha de Entrega */}
						<div className={styles.formGroup}>
							<label htmlFor="FechaEntrega" className={styles.formLabel}>
								Fecha de Entrega Estimada:
							</label>
							<input
								type="date"
								id="FechaEntrega"
								name="fecha_entrega"
								value={orden.fecha_entrega}
								min={obtenerFechaMinima()}
								onChange={(e) =>
									setOrden({
										...orden,
										fecha_entrega: e.target.value,
									})
								}
								disabled={creatingOrder}
								className={`${styles.formInput} ${
									errors.fecha_entrega ? styles.inputError : ""
								} ${creatingOrder ? styles.disabledInput : ''}`}
							/>
							{errors.fecha_entrega && (
								<span className={styles.errorText}>
									{errors.fecha_entrega}
								</span>
							)}
						</div>

						{/* Prioridad - Ahora desde la API */}
						<div className={styles.formGroup}>
							<label htmlFor="Prioridad" className={styles.formLabel}>
								Prioridad:
							</label>
							<select
								name="id_prioridad"
								id="Prioridad"
								value={orden.id_prioridad}
								onChange={handleChange}
								disabled={creatingOrder}
								className={`${styles.formInput} ${
									errors.prioridad ? styles.inputError : ""
								} ${creatingOrder ? styles.disabledInput : ''}`}
							>
								<option value="" disabled hidden>
									Seleccione una opción
								</option>
								{prioridades.map((prioridad) => (
									<option key={prioridad.id_prioridad} value={prioridad.id_prioridad}>
										{prioridad.descripcion}
									</option>
								))}
							</select>
							{errors.prioridad && (
								<span className={styles.errorText}>
									{errors.prioridad}
								</span>
							)}
						</div>

						{/* Productos */}
						<div className={styles.productsSection}>
							<div className={styles.productsContainer}>
								{fields.map((field, index) => (
									<div
										key={field.id}
										className={styles.productCard}
									>
										<div className={styles.productHeader}>
											<label className={styles.productTitle}>
												Producto {index + 1}
											</label>
											{fields.length > 1 && (
												<button
													type="button"
													onClick={() => removeField(field.id)}
													disabled={creatingOrder}
													className={`${styles.removeButton} ${
														creatingOrder ? styles.disabledButton : ''
													}`}
												>
													<svg
														className="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											)}
										</div>

										<div className={styles.productGrid}>
											<div className={styles.productField}>
												<label
													htmlFor={`producto-${field.id}`}
													className={styles.fieldLabel}
												>
													Producto
												</label>
												<select
													id={`producto-${field.id}`}
													value={field.id_producto}
													onChange={(e) =>
														updateProduct(field.id, e.target.value)
													}
													disabled={creatingOrder}
													className={`${styles.formInput} ${
														creatingOrder ? styles.disabledInput : ''
													}`}
												>
													<option value="" disabled hidden>
														Seleccione una opción
													</option>
													{products.map((product) => (
														<option
															key={product.id_producto}
															disabled={isProductoSeleccionado(
																product.id_producto,
																field.id
															)}
															value={product.id_producto}
															style={{
																color: isProductoSeleccionado(
																	product.id_producto,
																	field.id
																)
																	? "#999"
																	: "inherit",
															}}
														>
															{product.nombre} - {product.descripcion}
														</option>
													))}
												</select>
											</div>

											<div className={styles.productField}>
												<label
													htmlFor={`cantidad-${field.id}`}
													className={styles.fieldLabel}
												>
													Cantidad
												</label>
												<input
													id={`cantidad-${field.id}`}
													type="number"
													min="1"
													max="50"
													value={field.cantidad}
													onChange={(e) =>
														updateQuantity(
															field.id,
															Number.parseInt(e.target.value) || 1
														)
													}
													disabled={creatingOrder}
													className={`${styles.formInput} ${
														creatingOrder ? styles.disabledInput : ''
													}`}
												/>
											</div>

											<div className={styles.productField}>
												<label className={styles.fieldLabel}>
													Unidad de Medida
												</label>
												<div className={`${styles.measurementDisplay} ${
													creatingOrder ? styles.disabledInput : ''
												}`}>
													{field.unidad_medida || "Seleccione un producto"}
												</div>
											</div>
										</div>
									</div>
								))}

								{errors.productos && (
									<div className={styles.productsError}>
										<span className={styles.errorText}>
											{errors.productos}
										</span>
									</div>
								)}

								<div className={styles.actionsContainer}>
									{cantidadElementos < products.length && (
										<button
											type="button"
											onClick={addField}
											disabled={creatingOrder}
											className={`${styles.addButton} ${
												creatingOrder ? styles.disabledButton : ''
											}`}
										>
											<svg
												className="h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 4v16m8-8H4"
												/>
											</svg>
											Agregar Producto
										</button>
									)}

									<button
										type="submit"
										disabled={creatingOrder}
										className={`${styles.submitButton} ${
											creatingOrder ? styles.submitButtonLoading : ''
										}`}
									>
										{creatingOrder ? (
											<div className={styles.buttonLoadingContent}>
												<div className={styles.spinnerSmall}></div>
												<span>Creando Orden...</span>
											</div>
										) : (
											"Enviar Pedido"
										)}
									</button>
								</div>

								{/* Overlay de carga cuando se está creando la orden */}
								{creatingOrder && (
									<div className={styles.creatingOverlay}>
										<div className={styles.creatingContent}>
											<div className={styles.spinner}></div>
											<p className={styles.creatingText}>
												Creando orden de venta, por favor espere...
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default CrearOrdenDeVenta;