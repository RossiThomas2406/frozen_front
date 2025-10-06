import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import styles from './FormularioEmpleado.module.css';

const FormularioEmpleado = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		usuario: "",
		contrasena: "",
		nombre: "",
		apellido: "",
		id_rol: 1,
		id_departamento: 1,
		id_turno: 1,
	});

	const [cargando, setCargando] = useState(true);
	const [departamentos, setDepartamentos] = useState([]);
	const [roles, setRoles] = useState([]);
	const [turnos, setTurnos] = useState([]);
	const [errors, setErrors] = useState({});
	const [successMessage, setSuccessMessage] = useState("");
	const [faceVectors, setfaceVectors] = useState([]);
	const [analizandoRostro, setAnalizandoRostro] = useState(false);
	const videoRef = useRef(null);

	// Función para volver a la página anterior
	const handleVolver = () => {
		navigate(-1);
	};

	// Cargar modelos de face-api
	const loadFaceApiModels = async () => {
		const MODEL_URL = "/models";
		try {
			await Promise.all([
				faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
				faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
				faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
			]);
			console.log("Modelos cargados correctamente");
		} catch (err) {
			console.error("Error cargando modelos:", err.message);
		}
	};

	// Activar la cámara
	const startVideo = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			videoRef.current.srcObject = stream;
		} catch (err) {
			console.error("Error al acceder a la cámara:", err.message);
		}
	};

	// Detectar rostro y generar vectores
	const captureFace = async () => {
		setAnalizandoRostro(true);
		setSuccessMessage("");
		setErrors({ ...errors, rostro: null });
		if (!videoRef.current) return;

		const detections = await faceapi
			.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceDescriptor();

		if (detections) {
			setfaceVectors(detections.descriptor);
			setAnalizandoRostro(false);
			setSuccessMessage("✅ Rostro capturado con éxito.");
		} else {
			setAnalizandoRostro(false);
			setErrors({
				...errors,
				rostro: "No se detectó ningún rostro. Intenta de nuevo.",
			});
		}
	};

	//useEffect para cargar departamentos, roles, turnos y modelos
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [departamentosData, rolesData, turnosData] = await Promise.all([
					traerDepartamentos(),
					traerRoles(),
					traerTurnos()
				]);

				setDepartamentos(departamentosData);
				setRoles(rolesData);
				setTurnos(turnosData);
				
				await loadFaceApiModels();
				await startVideo();
				
				setCargando(false);
			} catch (error) {
				console.error("Error cargando datos:", error);
				setCargando(false);
			}
		};

		fetchData();
	}, []);

	const traerDepartamentos = async () => {
		try {
			const response = await fetch(
				"https://frozenback-test.up.railway.app/api/empleados/departamentos/"
			);
			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error("Error fetching departamentos:", error);
			return [];
		}
	};
	
	const traerRoles = async () => {
		try {
			const response = await fetch(
				"https://frozenback-test.up.railway.app/api/empleados/roles/"
			);
			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error("Error fetching roles:", error);
			return [];
		}
	};
	
	const traerTurnos = async () => {
		try {
			const response = await fetch(
				"https://frozenback-test.up.railway.app/api/empleados/turnos/"
			);
			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error("Error fetching turnos:", error);
			return [];
		}
	};

	// Manejo del formulario
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value,
		});
	};

	const validate = () => {
		const newErrors = {};

		const passwordError = validarPassword(form.contrasena);
		if (passwordError) {
			newErrors.contrasena = passwordError;
		}

		const usernameError = validarUsername(form.usuario);
		if (usernameError) {
			newErrors.usuario = usernameError;
		}

		const nombreError = validarNombreYApellido(form.nombre);
		if (nombreError) {
			newErrors.nombre = nombreError;
		}
		const apellidoError = validarNombreYApellido(form.apellido);

		if (apellidoError) {
			newErrors.apellido = apellidoError;
		}

		return newErrors;
	};

	function validarPassword(password) {
		if (password.length < 8) {
			return "Debe tener al menos 8 caracteres.";
		}
		if (!/[A-Z]/.test(password)) {
			return "Debe incluir al menos una letra mayúscula.";
		}
		if (!/[a-z]/.test(password)) {
			return "Debe incluir al menos una letra minúscula.";
		}
		if (!/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/]/.test(password)) {
			return "Debe incluir al menos un carácter especial.";
		}
		return null; // Si pasa todas las validaciones
	}

	function validarUsername(username) {
		if (username.length < 5) {
			return "El username debe tener al menos 5 caracteres.";
		}
		if (username.length < 5 || username.length > 20) {
			return "El username debe tener entre 3 y 20 caracteres.";
		}
		if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
			return "El username solo puede contener letras, números, puntos, guiones bajos y guiones.";
		}

		return null;
	}

	function validarNombreYApellido(cadena) {
		// 1. Quitar espacios iniciales/finales
		const limpio = cadena.trim();

		if (limpio.length < 2) {
			return "Debe tener al menos 2 caracteres.";
		}

		if (limpio.length > 50) {
			return "No puede superar los 50 caracteres.";
		}
		if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(limpio)) {
			return "Solo puede contener letras y espacios.";
		}
		return null;
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
		} else {
			if (faceVectors.length == 0) {
				setErrors({ ...errors, rostro: "Capture un rostro antes de enviar." });
				return;
			}
			setErrors({});
			await enviarDatosBackEnd();
		}
	};

	const enviarDatosBackEnd = async () => {
		try {
			console.log(JSON.stringify({ ...form, vector: Array.from(faceVectors) }));
			const response = await fetch(
				"https://frozenback-test.up.railway.app/api/empleados/crear/",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...form, vector: Array.from(faceVectors) }),
				}
			);

			// Si el status es 400 o cualquier error
			if (!response.ok) {
				const errorData = await response.json();
				console.error("Error del backend:", errorData.error);
				setErrors({ rostro: errorData.message || "Error en el servidor" });
				return; // corta la ejecución
			} else {
				setSuccessMessage("✅ Empleado registrado con éxito.");
			}

			setTimeout(() => {
				reiniciarFormulario();
			}, 5000);
		} catch (err) {
			console.error("Error enviando datos al backend:", err);
			setErrors({ submit: "Error enviando datos al servidor." });
		}
	};

	const reiniciarFormulario = () => {
		window.location.reload();
	};

	// Loader idéntico al componente Ventas
	if (cargando) return (
		<div className={styles.loading}>
			<div className={styles.spinner}></div>
			<p>Cargando formulario...</p>
		</div>
	);

	return (
		<div className={styles.container}>
			{/* Header sin botón volver */}
			<div className={styles.headerContainer}>
				<h1 className={styles.title}>Registro de Empleado</h1>
			</div>

			{/* Contenido */}
			<main className={styles.mainContent}>
				<form onSubmit={handleSubmit} className={styles.formContainer}>
					{/* Sección de información personal y credenciales */}
					<div className={styles.formSection}>
						<h3 className={styles.sectionTitle}>Información Personal</h3>
						<div className={styles.formGrid}>
							<div className={styles.inputGroup}>
								<label className={styles.label}>Nombre</label>
								<input
									type="text"
									name="nombre"
									value={form.nombre}
									onChange={handleChange}
									className={styles.input}
									placeholder="Ingrese el nombre"
								/>
								{errors.nombre && (
									<p className={styles.errorText}>{errors.nombre}</p>
								)}
							</div>

							<div className={styles.inputGroup}>
								<label className={styles.label}>Apellido</label>
								<input
									type="text"
									name="apellido"
									value={form.apellido}
									onChange={handleChange}
									className={styles.input}
									placeholder="Ingrese el apellido"
								/>
								{errors.apellido && (
									<p className={styles.errorText}>{errors.apellido}</p>
								)}
							</div>

							<div className={styles.inputGroup}>
								<label className={styles.label}>Username</label>
								<input
									type="text"
									name="usuario"
									value={form.usuario}
									onChange={handleChange}
									className={styles.input}
									placeholder="Ingrese el usuario"
								/>
								{errors.usuario && (
									<p className={styles.errorText}>{errors.usuario}</p>
								)}
							</div>

							<div className={styles.inputGroup}>
								<label className={styles.label}>Password</label>
								<input
									type="password"
									name="contrasena"
									value={form.contrasena}
									onChange={handleChange}
									className={styles.input}
									placeholder="Ingrese la contraseña"
								/>
								{errors.contrasena && (
									<p className={styles.errorText}>{errors.contrasena}</p>
								)}
							</div>
						</div>
					</div>

					{/* Sección de configuración laboral */}
					<div className={styles.formSection}>
						<h3 className={styles.sectionTitle}>Configuración Laboral</h3>
						<div className={styles.formGrid}>
							<div className={styles.inputGroup}>
								<label className={styles.label}>Rol</label>
								<select
									name="id_rol"
									value={form.id_rol}
									onChange={handleChange}
									className={styles.select}
								>
									{roles.map((e) => (
										<option key={e.id_rol} value={Number(e.id_rol)}>
											{e.descripcion}
										</option>
									))}
								</select>
							</div>

							<div className={styles.inputGroup}>
								<label className={styles.label}>Departamento</label>
								<select
									name="id_departamento"
									value={form.id_departamento}
									onChange={handleChange}
									className={styles.select}
								>
									{departamentos.map((e) => (
										<option key={e.id_departamento} value={Number(e.id_departamento)}>
											{e.descripcion}
										</option>
									))}
								</select>
							</div>

							<div className={styles.inputGroup}>
								<label className={styles.label}>Turno</label>
								<select
									name="id_turno"
									value={form.id_turno}
									onChange={handleChange}
									className={styles.select}
								>
									{turnos.map((e) => (
										<option key={e.id_turno} value={Number(e.id_turno)}>
											{e.descripcion}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Sección de cámara - Más ancha y con mejor proporción */}
					<div className={styles.formSection}>
						<h3 className={styles.sectionTitle}>Registro Facial</h3>
						<div className={styles.cameraSection}>
							<div className={styles.videoContainer}>
								<video
									ref={videoRef}
									autoPlay
									muted
									className={styles.video}
								></video>
							</div>
							<div className={styles.cameraButtons}>
								<button
									type="button"
									onClick={captureFace}
									className={styles.captureButton}
								>
									Capturar Rostro
								</button>
							</div>
							{errors.rostro && (
								<p className={styles.errorText}>{errors.rostro}</p>
							)}
							{successMessage && (
								<p className={styles.successText}>
									{successMessage}
								</p>
							)}
							{analizandoRostro && (
								<p className={styles.analyzingText}>
									Analizando rostro...
								</p>
							)}
						</div>
					</div>

					{/* Botones de acción */}
					<div className={styles.buttonsContainer}>
						<button
							type="button"
							onClick={handleVolver}
							className={styles.secondaryButton}
						>
							Volver
						</button>
						<button
							type="submit"
							className={styles.primaryButton}
						>
							Registrar Empleado
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}

export default FormularioEmpleado;