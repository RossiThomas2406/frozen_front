import React from "react";
import styles from "./CrearOrdenDeVenta.module.css";
import { useState, useEffect } from "react";

function CrearOrdenDeVenta() {
	const [clientes, setClientes] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [fields, setFields] = useState([
		{ id: "1", id_producto: "", cantidad: 1 },
	]);
	const [orden, setOrden] = useState({
		id_cliente: 1,
		prioridad: "",
		fecha_entrega: "",
		productos: [],
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
	};

	const addField = () => {
		const newField = {
			id: Date.now().toString(),
			id_producto: "",
			cantidad: 1,
		};
		setFields([...fields, newField]);
	};

	const removeField = (id) => {
		if (fields.length > 1) {
			setFields(fields.filter((field) => field.id !== id));
		}
	};

	const updateProduct = (id, id_producto) => {
		setFields(
			fields.map((field) =>
				field.id === id ? { ...field, id_producto } : field
			)
		);
	};

	const updateQuantity = (id, cantidad) => {
		setFields(
			fields.map((field) =>
				field.id === id ? { ...field, cantidad: Math.max(1, cantidad) } : field
			)
		);
	};

	const handleSubmit = async  (event) => {
		event.preventDefault();
		//agregamos los productos al objeto orden sin el id
		const productosConIdDinamico = [...fields];
		let productos = agregarSinId( productosConIdDinamico);
		const nuevaOrden = { ...orden, productos: productos };

		try {
			const response = await fetch("https://frozenback-test.up.railway.app/api/ventas/ordenes-venta/crear/",
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
			}
		} catch (error) {
			console.log(error)
		}

	};

	function agregarSinId(arrayOrigen) {
		// Clonamos cada objeto de origen pero excluyendo la propiedad "id"
		const sinId = arrayOrigen.map(({ id, ...resto }) => resto);
		return sinId;
	}

	if (loading) {
		return (
			<div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<span className="ml-2 text-gray-600">Cargando productos...</span>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className={styles.container}>
			<h1 className={styles.title}>
				<span className={styles.titleIcon}>🧩</span>
				Crear Orden de Venta
			</h1>
			<div className="divFormulario">
				<form onSubmit={handleSubmit}>
					<div className={styles.divFormulario}>
						<label htmlFor="Cliente">Cliente:</label>
						<select name="id_cliente" id="Cliente" onChange={handleChange}>
							{clientes.map((cliente) => (
								<option key={cliente.id_cliente} value={cliente.id_cliente}>
									{cliente.nombre}
								</option>
							))}
						</select>
						<label htmlFor="FechaEntrega">Fecha de Entrega Estimada:</label>
						<input
							type="date"
							id="FechaEntrega"
							name="fecha_entrega"
							value={orden.fecha_entrega}
							onChange={(e) =>
								setOrden({
									...orden,
									fecha_entrega: e.target.value,
								})
							}
						/>
						<label htmlFor="Prioridad">Prioridad:</label>
						<select
							name="prioridad"
							id="Prioridad"
							value={orden.prioridad}
							onChange={handleChange}
						>
							<option value="Baja">Baja</option>
							<option value="Normal">Normal</option>
							<option value="Alta">Alta</option>
							<option value="Urgente">Urgente</option>
						</select>

						<div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
							<div className="p-6">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="p-4 border border-gray-300 rounded-lg bg-gray-50"
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
															value={product.id_producto}
														>
															{product.nombre}
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

								<div className="flex flex-col sm:flex-row gap-4">
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

/*						<label htmlFor="productos">Productos:</label>
						<div className={styles.productosContainer}>
							{productosForm.map((producto, index) => {
								return (
									<React.Fragment key={index}>
										<select key={index} name="productos" value={1}>
											{productosFetch.map((productos) => (
												<option
													key={productos.id_producto}
													value={productos.id_producto}
												>
													{productos.nombre}
												</option>
											))}
										</select>

										<input
											type="number"
											onChange={(e) => {
												let value = e.target.value;
												manejarCambioProductos(
													Number(value),
													producto.id_producto
												);
											}}
										/>
									</React.Fragment>
								);
							})}

							<button type="button" onClick={agregarProducto}>
								+ Agregar producto
							</button>
						</div> */
