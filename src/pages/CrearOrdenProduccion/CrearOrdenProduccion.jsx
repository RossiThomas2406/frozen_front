import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CrearOrdenProduccion.module.css";

const CrearOrdenProduccion = () => {
	// Estados del formulario
	const [formData, setFormData] = useState({
		startDate: "",
		product: "",
		quantity: "",
		productionLine: "",
	});

	const [alert, setAlert] = useState({ message: "", type: "", visible: false });
	const [productOptions, setProductOptions] = useState([]);
	const [productionLineOptions, setProductionLineOptions] = useState([]);
	const [filteredLineOptions, setFilteredLineOptions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [responsable, setResponsable] = useState("");
	const [idUsuario, setIdUsuario] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [selectedProductUnit, setSelectedProductUnit] = useState("");
	const [loadingLines, setLoadingLines] = useState(false);

	// Efecto para cargar productos y líneas de producción desde la API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				// Realizar ambas peticiones en paralelo
				const [productosResponse, lineasResponse] = await Promise.all([
					axios.get(
						"https://frozenback-test.up.railway.app/api/productos/listar/"
					),
					axios.get(
						"https://frozenback-test.up.railway.app/api/produccion/lineas/"
					),
				]);

				// Procesar productos
				const productsArray = productosResponse.data.results;
				if (!Array.isArray(productsArray)) {
					throw new Error(
						"La respuesta de productos no contiene un formato válido"
					);
				}

				const transformedProducts = productsArray.map((product) => ({
					value: product.id_producto.toString(),
					label: product.nombre,
					descripcion: product.descripcion,
					unidad_medida: product.unidad_medida,
				}));

				if (transformedProducts.length === 0) {
					throw new Error("No se encontraron productos");
				}

				setProductOptions(transformedProducts);

				// Procesar líneas de producción (todas las líneas disponibles)
				const lineasArray = lineasResponse.data.results;
				if (!Array.isArray(lineasArray)) {
					throw new Error(
						"La respuesta de líneas de producción no contiene un formato válido"
					);
				}

				const transformedLineas = lineasArray.map((linea) => ({
					value: linea.id_linea_produccion.toString(),
					label: linea.descripcion,
				}));

				if (transformedLineas.length === 0) {
					throw new Error("No se encontraron líneas de producción");
				}

				setProductionLineOptions(transformedLineas);
				setFilteredLineOptions([]);
			} catch (error) {
				console.error("Error fetching data:", error);
				const errorMessage = error.response?.data?.message || error.message;
				showAlert("Error al cargar los datos: " + errorMessage, "error");

				if (error.message.includes("productos")) {
					setProductOptions([]);
				} else if (error.message.includes("líneas")) {
					setProductionLineOptions([]);
				}
			} finally {
				setLoading(false);
			}
		};

		// Obtener responsable e id_usuario del localStorage
		const obtenerUsuario = () => {
			try {
				const usuarioStorage = localStorage.getItem("usuario");
				if (usuarioStorage) {
					const usuario = JSON.parse(usuarioStorage);
					if (usuario.nombre && usuario.apellido) {
						setResponsable(`${usuario.nombre} ${usuario.apellido}`);
					}
					if (usuario.id_empleado) {
						setIdUsuario(usuario.id_empleado.toString());
					}
				}
			} catch (error) {
				console.error("Error al obtener datos del usuario:", error);
				setResponsable("Usuario no identificado");
			}
		};

		// Inicializar fecha
		const today = new Date().toISOString().split("T")[0];
		setFormData((prev) => ({
			...prev,
			startDate: today,
		}));

		obtenerUsuario();
		fetchData();
	}, []);

	// Función para obtener líneas de producción compatibles con el producto
	const fetchLineasPorProducto = async (idProducto) => {
		try {
			setLoadingLines(true);

			const response = await axios.post(
				"https://frozenback-test.up.railway.app/api/recetas/lineas_por_producto/",
				{
					id_producto: parseInt(idProducto),
				}
			);

			// La API devuelve un array directo con las líneas compatibles
			const lineasCompatibles = response.data;

			if (!Array.isArray(lineasCompatibles)) {
				throw new Error(
					"La respuesta de líneas compatibles no contiene un formato válido"
				);
			}

			// Transformar las líneas compatibles al mismo formato que productionLineOptions
			const lineasFiltradas = lineasCompatibles.map((linea) => ({
				value: linea.id_linea_produccion.toString(),
				label: linea.descripcion,
			}));

			setFilteredLineOptions(lineasFiltradas);

			// Si la línea actualmente seleccionada no está en las compatibles, limpiar la selección
			if (
				formData.productionLine &&
				!lineasFiltradas.some(
					(linea) => linea.value === formData.productionLine
				)
			) {
				setFormData((prev) => ({
					...prev,
					productionLine: "",
				}));
			}

			// Mostrar mensaje informativo si no hay líneas compatibles
			if (lineasFiltradas.length === 0) {
				console.warn(
					`No se encontraron líneas compatibles para el producto ${idProducto}`
				);
			}
		} catch (error) {
			console.error("Error al cargar líneas compatibles:", error);
			const errorMessage = error.response?.data?.message || error.message;
			showAlert(
				"Error al cargar líneas de producción compatibles: " + errorMessage,
				"error"
			);
			setFilteredLineOptions([]);
		} finally {
			setLoadingLines(false);
		}
	};


	// Manejar cambios en los inputs
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "product") {
			// Encontrar el producto seleccionado para obtener su unidad de medida
			const selectedProduct = productOptions.find(
				(product) => product.value === value
			);
			setSelectedProductUnit(
				selectedProduct ? selectedProduct.unidad_medida : ""
			);

			// Limpiar la selección de línea de producción cuando cambia el producto
			setFormData((prev) => ({
				...prev,
				product: value,
				productionLine: "", // Limpiar la línea seleccionada
			}));

			// Si se seleccionó un producto válido, cargar las líneas compatibles
			if (value) {
				fetchLineasPorProducto(value);
			} else {
				// Si no hay producto seleccionado, limpiar las líneas filtradas
				setFilteredLineOptions([]);
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	// Mostrar alerta
	const showAlert = (message, type) => {
		setAlert({ message, type, visible: true });
		setTimeout(() => {
			setAlert((prev) => ({ ...prev, visible: false }));
		}, 5000);
	};

	// Función para enviar datos a la API
	const enviarOrdenProduccion = async (ordenData) => {
		try {
			const response = await axios.post(
				"https://frozenback-test.up.railway.app/api/produccion/ordenes/",
				ordenData
			);
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message;
			throw new Error(errorMessage);
		}
	};

	// Manejar envío del formulario
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		// Validaciones básicas
		if (!formData.product || !formData.quantity || !formData.productionLine) {
			showAlert("Por favor, completa todos los campos obligatorios.", "error");
			setSubmitting(false);
			return;
		}

		// Validar que tenemos el id_usuario
		if (!idUsuario) {
			showAlert(
				"No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.",
				"error"
			);
			setSubmitting(false);
			return;
		}

		try {
			// Preparar datos para enviar
			const ordenData = {
				id_supervisor: parseInt(idUsuario),
				id_producto: parseInt(formData.product),
				cantidad: parseInt(formData.quantity),
				id_linea_produccion: parseInt(formData.productionLine),
				fecha_inicio: formData.startDate,
			};

			// Enviar a la API
			const resultado = await enviarOrdenProduccion(ordenData);

			showAlert("¡Orden de producción creada exitosamente!", "success");

			// Resetear formulario después de enviar
			setTimeout(() => {
				resetForm();
				setSubmitting(false);
			}, 2000);
		} catch (error) {
			console.error("Error al crear orden:", error);
			showAlert(`Error al crear la orden: ${error.message}`, "error");
			setSubmitting(false);
		}
	};

	// Resetear formulario
	const resetForm = () => {
		const today = new Date().toISOString().split("T")[0];

		setFormData({
			startDate: today,
			product: "",
			quantity: "",
			productionLine: "",
		});
		setSelectedProductUnit("");
		setFilteredLineOptions([]);
	};

	// Manejar cancelación
	const handleCancel = () => {
		if (
			window.confirm(
				"¿Estás seguro de que deseas cancelar? Se perderán todos los datos no guardados."
			)
		) {
			resetForm();
		}
	};

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<div className={styles.logo}>
						Formulario de Creacion de Orden de Produccion
					</div>
				</div>
			</header>

			<div className={styles.formContainer}>
				{alert.visible && (
					<div
						className={`${styles.alert} ${
							styles[
								`alert${
									alert.type.charAt(0).toUpperCase() + alert.type.slice(1)
								}`
							]
						}`}
					>
						{alert.message}
					</div>
				)}

				{loading ? (
					<div className={styles.loaderContainer}>
						<div className={styles.loader}></div>
						<p>Cargando formulario...</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className={styles.form}>
						<div className={styles.formSection}>
							<div className={styles.formRow}>
								<div className={styles.formGroup}>
									<label htmlFor="responsable">Responsable</label>
									<input
										type="text"
										id="responsable"
										value={responsable}
										disabled
										className={styles.disabledInput}
									/>
								</div>
							</div>
							<div className={styles.formRow}>
								<div className={styles.formGroup}>
									<label htmlFor="product" className={styles.required}>
										Producto
									</label>
									<select
										id="product"
										name="product"
										value={formData.product}
										onChange={handleInputChange}
										required
										disabled={submitting || productOptions.length === 0}
									>
										<option value="">
											{productOptions.length === 0
												? "No hay productos disponibles"
												: "Seleccionar producto"}
										</option>
										{productOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label} - {option.descripcion}
											</option>
										))}
									</select>
									{productOptions.length === 0 && !loading && (
										<small className={styles.errorText}>
											No se pudieron cargar los productos.
										</small>
									)}
								</div>
								<div className={styles.formGroup}>
									<label htmlFor="quantity" className={styles.required}>
										Cantidad{selectedProductUnit && ` (${selectedProductUnit})`}
									</label>
									<input
										type="number"
										id="quantity"
										name="quantity"
										value={formData.quantity}
										onChange={handleInputChange}
										min="1"
										required
										disabled={submitting}
										placeholder={
											selectedProductUnit
												? `Ingrese la cantidad en ${selectedProductUnit}`
												: "Ingrese la cantidad"
										}
									/>
								</div>
							</div>
							<div className={styles.formRow}>
								<div className={styles.formGroup}>
									<label htmlFor="productionLine" className={styles.required}>
										Línea de Producción
										{loadingLines && (
											<small className={styles.loadingText}>
												{" "}
												(Cargando líneas compatibles...)
											</small>
										)}
										{formData.product &&
											filteredLineOptions.length > 0 &&
											!loadingLines && (
												<small className={styles.successText}>
													{" "}
													({filteredLineOptions.length} línea(s) compatible(s))
												</small>
											)}
									</label>
									<select
										id="productionLine"
										name="productionLine"
										value={formData.productionLine}
										onChange={handleInputChange}
										required
										disabled={
											submitting ||
											loadingLines ||
											!formData.product ||
											filteredLineOptions.length === 0
										}
									>
										<option value="">
											{!formData.product
												? "Seleccione un producto primero"
												: loadingLines
												? "Cargando líneas compatibles..."
												: filteredLineOptions.length === 0
												? "No hay líneas compatibles para este producto"
												: "Seleccionar línea compatible"}
										</option>
										{filteredLineOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									{formData.product &&
										filteredLineOptions.length === 0 &&
										!loadingLines && (
											<small className={styles.errorText}>
												No hay líneas de producción compatibles con el producto
												seleccionado.
											</small>
										)}
								</div>
							</div>
							<div className={styles.formRow}>
								<div className={styles.formGroup}>
									<label htmlFor="startDate" className={styles.required}>
										Fecha de Inicio Planificada
									</label>
									<input
										type="date"
										id="startDate"
										name="startDate"
										value={formData.startDate}
										onChange={handleInputChange}
										required
										disabled={submitting}
									/>
								</div>
							</div>
						</div>

						{/* Acciones del Formulario */}
						<div className={styles.formActions}>
							<button
								type="button"
								onClick={handleCancel}
								className={`${styles.btn} ${styles.btnSecondary}`}
								disabled={submitting}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className={`${styles.btn} ${styles.btnPrimary}`}
								disabled={
									submitting ||
									productOptions.length === 0 ||
									!formData.productionLine ||
									!idUsuario
								}
							>
								{submitting ? (
									<>
										<div className={styles.submitLoader}></div>
										Creando...
									</>
								) : (
									"Crear"
								)}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default CrearOrdenProduccion;
