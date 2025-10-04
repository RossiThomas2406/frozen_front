import axios from 'axios'


export const obtenerOrdenesDeProduccion = async () => {
    try {
        const response = await axios.get('https://frozenback-test.up.railway.app/api/produccion/ordenes-produccion/listar/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las órdenes de producción:', error);
        throw error;
    }
};
