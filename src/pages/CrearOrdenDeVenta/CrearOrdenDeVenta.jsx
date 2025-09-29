import React from "react";
import styles from "./CrearOrdenDeVenta.module.css";
import { useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";



function CrearOrdenDeVenta() {
	const [cantidadElementos, setCantidadElementos] = useState(1);
	const [clientes, setClientes] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fields, setFields] = useState([
		{ id: "1", id_producto: "", cantidad: 1 },
	]);
	const [orden, setOrden] = useState({
		id_cliente: "",
		prioridad: "",
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
			const clientes = await obtenerClientes();
			const productos = await obtenerProductos();

			setProducts(productos);
			setClientes(clientes);
			setLoading(false);
		};

		fetchApis();
	}, []);

	const obtenerProductos = async () => {
		const response = await fetch(
			"https://frozenback-test.up.railway.app/api/productos/productos/"
		);
		const productos = await response.json();
		return productos;
	};

	const obtenerClientes = async () => {
		const response = await fetch(
			"https://frozenback-test.up.railway.app/api/ventas/clientes/"
		);
		const clientes = await response.json();
		return clientes;
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
		// Verificar si el producto ya está seleccionado en otro campo
		const productoYaSeleccionado = fields.some(
			(field) => field.id !== id && field.id_producto === id_producto
		);

		if (productoYaSeleccionado && id_producto !== "") {
			alert(
				"Este producto ya ha sido seleccionado. Por favor, elige otro producto."
			);
			return;
		}

		setFields(
			fields.map((field) =>
				field.id === id ? { ...field, id_producto } : field
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
		if (!orden.prioridad || orden.prioridad === "") {
			nuevosErrores.prioridad = "Debes seleccionar una prioridad";
			esValido = false;
		}

		// Validar fecha de entrega (mínimo 3 días desde hoy)
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

		// Validar que haya al menos un producto seleccionado
		const productosSeleccionados = fields.filter(
			(field) => field.id_producto !== ""
		);
		if (productosSeleccionados.length === 0) {
			nuevosErrores.productos = "Debes seleccionar al menos un producto";
			esValido = false;
		}

		// Validar que no haya productos duplicados
		const idsProductos = fields
			.filter((field) => field.id_producto !== "")
			.map((field) => field.id_producto);
		const productosUnicos = new Set(idsProductos);

		if (idsProductos.length !== productosUnicos.size) {
			nuevosErrores.productos =
				"No puedes seleccionar el mismo producto más de una vez";
			esValido = false;
		}

		setErrors(nuevosErrores);
		return esValido;
	};
	/*VALIDACIONES */

	const handleSubmit = async (event) => {
		event.preventDefault();
		//agregamos los productos al objeto orden sin el id
		const productosConIdDinamico = [...fields];
		let productos = agregarSinId(productosConIdDinamico);
		const nuevaOrden = { ...orden, productos: productos };
		if (!validarFormulario()) {
			// Si el formulario no es válido, detener el envío
			return;
		}
		try {
			const response = await fetch(
				"https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/crear/",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(nuevaOrden),
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log("Orden de venta creada:", data);
				// Reiniciar el formulario
				setOrden({
					id_cliente: 1,
					prioridad: "",
					fecha_entrega: "",
					productos: [],
				});
				setFields([{ id: "1", id_producto: "", cantidad: 1 }]);
				setErrors({
					cliente: "",
					prioridad: "",
					fecha_entrega: "",
					productos: "",
				});
				alert("Orden de venta creada exitosamente");
			}
		} catch (error) {
			console.log(error);
		}
	};

	function agregarSinId(arrayOrigen) {
		// Clonamos cada objeto de origen pero excluyendo la propiedad "id"
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

	if (loading) {
		return (
			<div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-center">
						<MoonLoader color="#0a05ff" />
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>
				Crear Orden de Venta
			</h1>
			<div className="divFormulario">
				<form onSubmit={handleSubmit}>
					<div className={styles.divFormulario}>
						<label htmlFor="Cliente">Cliente:</label>
						<select
							name="id_cliente"
							id="Cliente"
							value={orden.id_cliente}
							onChange={handleChange}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
								errors.cliente ? "border-red-500" : "border-gray-300"
							}`}
						>
							{clientes.map((cliente) => (
								<option key={cliente.id_cliente} value={cliente.id_cliente}>
									{cliente.nombre}
								</option>
							))}
						</select>
						{errors.cliente && (
							<span className="text-red-500 text-sm mt-1 block">
								{errors.cliente}
							</span>
						)}
						<label htmlFor="FechaEntrega">Fecha de Entrega Estimada:</label>
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
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
								errors.fecha_entrega ? "border-red-500" : "border-gray-300"
							}`}
						/>
						{errors.fecha_entrega && (
							<span className="text-red-500 text-sm mt-1 block">
								{errors.fecha_entrega}
							</span>
						)}
						<label htmlFor="Prioridad">Prioridad:</label>
						<select
							name="prioridad"
							id="Prioridad"
							value={orden.prioridad}
							onChange={handleChange}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
								errors.prioridad ? "border-red-500" : "border-gray-300"
							}`}
						>
							<option value="Baja">Baja</option>
							<option value="Normal">Normal</option>
							<option value="Alta">Alta</option>
							<option value="Urgente">Urgente</option>
						</select>
						{errors.prioridad && (
							<span className="text-red-500 text-sm mt-1 block">
								{errors.prioridad}
							</span>
						)}
						<div className="w-full  mx-auto bg-white rounded-lg ">
							<div className="p-6">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="p-4 border border-gray-300 rounded-lg bg-gray-50 mb-4"
									>
										<div className="flex items-center justify-between mb-4">
											<label className="text-lg font-semibold text-gray-700">
												Producto {index + 1}
											</label>
											{fields.length > 1 && (
												<button
													type="button"
													onClick={() => removeField(field.id)}
													className="h-8 w-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
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

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<label
													htmlFor={`producto-${field.id}`}
													className="block text-sm font-medium text-gray-700"
												>
													Producto
												</label>
												<select
													id={`producto-${field.id}`}
													value={field.id_producto}
													onChange={(e) =>
														updateProduct(field.id, e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
												>
													<option value="">Selecciona un producto</option>
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
															{product.nombre}
															{isProductoSeleccionado(
																product.id_producto,
																field.id
															) && " (Ya seleccionado)"}
														</option>
													))}
												</select>
											</div>

											<div className="space-y-2">
												<label
													htmlFor={`cantidad-${field.id}`}
													className="block text-sm font-medium text-gray-700"
												>
													Cantidad
												</label>
												<input
													id={`cantidad-${field.id}`}
													type="number"
													min="1"
													value={field.cantidad}
													onChange={(e) =>
														updateQuantity(
															field.id,
															Number.parseInt(e.target.value) || 1
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												/>
											</div>
										</div>
									</div>
								))}

								{errors.productos && (
									<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
										<span className="text-red-600 text-sm">
											{errors.productos}
										</span>
									</div>
								)}
								<div className="flex flex-col sm:flex-row gap-4">
									{cantidadElementos < products.length && (
										<button
											type="button"
											onClick={addField}
											className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
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
											Agregar Campo
										</button>
									)}

									<button
										type="submit"
										className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors duration-200"
										onClick={handleSubmit}
									>
										Enviar Pedido
									</button>
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default CrearOrdenDeVenta;
