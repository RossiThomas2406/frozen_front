import { Outlet, Navigate } from "react-router-dom";


const ProtectedLogin = () =>{
    const user = localStorage.getItem('usuario');

    return !user ?  <Outlet></Outlet> : <Navigate to={"/home"}></Navigate>
}

export default ProtectedLogin