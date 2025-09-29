import React from "react";
import styles from "./CrearOrdenDeVenta.module.css";
import { useState } from "react";

const clientesMock = [
	{ id: 1, nombre: "Cliente A" },
	{ id: 2, nombre: "Cliente B" },
	{ id: 3, nombre: "Cliente C" },
];

const productosMock = [
	{ id: 1, nombre: "Pizza de Jamon y Queso", precio: 100 },
	{ id: 2, nombre: "Hamburguesa de carne", precio: 200 },
	{ id: 3, nombre: "Papas Fritas", precio: 300 },
	{ id: 4, nombre: "Helado de Vainilla", precio: 400 },
];

function CrearOrdenDeVenta() {
	const [productos, setProductos] = useState([""]);
	const [ordenDeVenta, setOrdenDeVenta] = useState({
		clienteId: "",
		FechaEntrega: "",
		productos: productos,
		total: 0,
	});

	const agregarProducto = (producto) => {
		setProductos([...productos, producto]);
	};

	const manejarCambioProductos = (index, valor) => {
		const copia = [...productos];
		copia[index] = valor;
		setProductos(copia);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
	};
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
						<select name="Cliente" id="Cliente">
							{clientesMock.map((cliente) => (
								<option key={cliente.id} value={cliente.id}>
									{cliente.nombre}
								</option>
							))}
						</select>
						<label htmlFor="FechaEntrega">Fecha de Entrega Estimada:</label>
						<input
							type="date"
							id="FechaEntrega"
							name="FechaEntrega"
							value={ordenDeVenta.FechaEntrega}
							onChange={(e) =>
								setOrdenDeVenta({
									...ordenDeVenta,
									FechaEntrega: e.target.value,
								})
							}
						/>
						<label htmlFor="Prioridad">Prioridad:</label>
						<select
							name="Prioridad"
							id="Prioridad"
							value={ordenDeVenta.Prioridad}
							onChange={(e) =>
								setOrdenDeVenta({
									...ordenDeVenta,
									Prioridad: e.target.value,
								})
							}
						>
							<option value="Baja">Baja</option>
							<option value="Normal">Normal</option>
							<option value="Alta">Alta</option>
							<option value="Urgente">Urgente</option>
						</select>

						<label htmlFor="productos">Productos:</label>
						<div className={styles.productosContainer}>
							{productos.map((producto, index) => {
								return (
									<select
										name="productos"
										id="productos"
										value={ordenDeVenta.productos[index]}
                                        onChange={(e) =>
                                            manejarCambioProductos(index, e.target.value)
                                        }
                                    >
                                        {productosMock.map((producto) => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.nombre}
                                            </option>
                                        ))}
                                    </select>
                                );
                            })}



                                

							<button type="button" onClick={agregarProducto}>
								+ Agregar producto
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default CrearOrdenDeVenta;
