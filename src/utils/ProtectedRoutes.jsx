import { Outlet, Navigate } from "react-router-dom";


const ProtectedRoutes = () =>{
    const user = localStorage.getItem('usuario');

    return user ?  <Outlet></Outlet> : <Navigate to={"/"}></Navigate>
}

export default ProtectedRoutes