import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";

export default function FormularioEmpleado() {
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
    const [faceVectors, setfaceVectors] = useState([])
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
				const departamentosData = await traerDepartamentos();
				const rolesData = await traerRoles();
				const turnosData = await traerTurnos();

				setDepartamentos(departamentosData);
				setRoles(rolesData);
				setTurnos(turnosData);
				setCargando(false);

				loadFaceApiModels().then(() => startVideo());
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, []);

	const traerDepartamentos = async () => {
		try {
			const response = await fetch(
				"https://frozenback-production.up.railway.app/api/empleados/departamentos/"
			);
			const departamentos = await response.json();
			return departamentos;
		} catch (error) {
			console.log(error);
		}
	};
	const traerRoles = async () => {
		try {
			const response = await fetch(
				"https://frozenback-production.up.railway.app/api/empleados/roles/"
			);
			const roles = await response.json();
			return roles;
		} catch (error) {
			console.log(error);
		}
	};
	const traerTurnos = async () => {
		try {
			const response = await fetch(
				"https://frozenback-production.up.railway.app/api/empleados/turnos/"
			);
			const turnos = await response.json();
			return turnos;
		} catch (error) {
			console.log(error);
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
		if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
		if (!form.apellido.trim())
			newErrors.apellido = "El apellido es obligatorio";
		if (!form.usuario.trim()) newErrors.usuario = "El usuario es obligatorio";
		if (!form.contrasena.trim()) {
			newErrors.contrasena = "La contraseña es obligatoria";
		} else if (form.contrasena.length < 7) {
			newErrors.contrasena = "La contraseña debe tener al menos 8 caracteres";
		}
		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
		} else {
			setErrors({});
			if (!faceVectors) {
				alert("Debe registrar el rostro antes de enviar.");
				return;
			}
			await enviarDatosBackEnd();
		}
	};

	const enviarDatosBackEnd = async () => {
		try {
            console.log(JSON.stringify({ ...form, vector: Array.from(faceVectors) }))
			const response = await fetch(
				"https://frozenback-production.up.railway.app/api/empleados/crear/",
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

	return (
		<>
			{cargando ? (
				<p>Cargando...</p>
			) : (
				<div className="min-h-screen flex flex-col">
					{/* Header */}
					<header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 text-center shadow-md relative">
						<button
							onClick={handleVolver}
							className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Volver
						</button>
						<h1 className="text-2xl font-semibold">Registro de Empleado</h1>
					</header>

					{/* Contenido */}
					<main className="flex-grow flex items-center justify-center bg-gray-100 p-6">
						<form
							onSubmit={handleSubmit}
							className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg"
						>
							{/* Campos de formulario */}
							{[
								{
									label: "Nombre",
									name: "nombre",
									placeholder: "Ingrese el nombre",
								},
								{
									label: "Apellido",
									name: "apellido",
									placeholder: "Ingrese el apellido",
								},
								{
									label: "Username",
									name: "usuario",
									placeholder: "Ingrese el usuario",
								},
							].map((field) => (
								<div key={field.name} className="mb-4">
									<label className="block text-gray-700 font-medium mb-2">
										{field.label}
									</label>
									<input
										type="text"
										name={field.name}
										value={form[field.name]}
										onChange={handleChange}
										className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder={field.placeholder}
									/>
									{errors[field.name] && (
										<p className="text-red-500 text-sm">{errors[field.name]}</p>
									)}
								</div>
							))}
							{/* Password */}
							<div className="mb-6">
								<label className="block text-gray-700 font-medium mb-2">
									Password
								</label>
								<input
									type="password"
									name="contrasena"
									value={form.password}
									onChange={handleChange}
									className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
									placeholder="Ingrese la contraseña"
								/>
								{errors.password && (
									<p className="text-red-500 text-sm">{errors.password}</p>
								)}
							</div>

							{/* Rol */}
							<div className="mb-4">
								<label className="block text-gray-700 font-medium mb-2">
									Rol
								</label>
								<select
									name="id_rol"
									value={form.id_rol}
									onChange={handleChange}
									className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{roles.map((e) => {
										return (
											<option key={e.id_rol} value={Number(e.id_rol)}>
												{e.descripcion}
											</option>
										);
									})}
								</select>
							</div>
							{/* Rol */}

							{/* Departamento */}
							<div className="mb-4">
								<label className="block text-gray-700 font-medium mb-2">
									Departamento
								</label>
								<select
									name="id_departamento"
									value={form.id_departamento}
									onChange={handleChange}
									className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{departamentos.map((e) => {
										return (
											<option key={e.id_departamento} value={Number(e.id_departamento)}>
												{e.descripcion}
											</option>
										);
									})}
								</select>
							</div>
							{/* Departamento */}

							{/* Turno */}
							<div className="mb-4">
								<label className="block text-gray-700 font-medium mb-2">
									Turno
								</label>
								<select
									name="id_turno"
									value={form.turno}
									onChange={handleChange}
									className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{turnos.map((e) => {
										return (
											<option key={e.id_turno} value={Number(e.id_turno)}>
												{e.descripcion}
											</option>
										);
									})}
								</select>
							</div>

							{/* Turno */}

							{/* Cámara */}
							<div className="mb-6">
								<label className="block text-gray-700 font-medium mb-2">
									Registro Facial
								</label>
								<video
									ref={videoRef}
									autoPlay
									muted
									width="100%"
									className="rounded-lg border border-gray-300"
								></video>
								<button
									type="button"
									onClick={captureFace}
									className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
								>
									Capturar Rostro
								</button>
								{errors.rostro && (
									<p className="text-red-500 text-sm">{errors.rostro}</p>
								)}
								{successMessage && (
									<p className="text-green-500 text-sm mt-2">
										{successMessage}
									</p>
								)}

								{analizandoRostro && (
									<p className="text-blue-500 text-sm mt-2">
										Analizando rostro...
									</p>
								)}
							</div>

							{/* Botones de acción */}
							<div className="flex gap-4">
								<button
									type="button"
									onClick={handleVolver}
									className="w-1/3 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
								>
									Volver
								</button>
								<button
									type="submit"
									className="w-2/3 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
								>
									Registrar
								</button>
							</div>
						</form>
					</main>
				</div>
			)}
		</>
	);
}
