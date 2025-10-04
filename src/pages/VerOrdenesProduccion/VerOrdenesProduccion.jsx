import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './VerOrdenesProduccion.module.css';

export default function VerOrdenesProduccion () {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const response = await axios.get('https://frozenback-test.up.railway.app/api/produccion/ordenes-produccion/listar/');
                setOrdenes(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar las órdenes de producción');
            }
        }
        fetchOrdenes();
    }, []);

}