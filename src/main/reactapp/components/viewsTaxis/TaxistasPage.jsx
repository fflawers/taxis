import React from "react";
import IndexFooter from "../Footers/IndexFooter";
import TaxistaNavbar from "../Nabvars/TaxistaNavbar";
import { useAuth } from "../secure/AuthContext";

const TaxistasPage = () =>{

    const { user } = useAuth();
    
    return(
        <div>
            <TaxistaNavbar/>
            <div className="m-0 p-0">
            <h1 className="text-center container mt-5 fw-bolder">
                Hola.
            </h1>
            <p className="fw-bolder container text-taxi my-5 text-center">Aquí encontrarás los reportes y acuerdos que se generen con tu taxi en el menú superior. <br/>Que tengas un buen día {user?.nombre}</p>
            </div>
            <IndexFooter/>
        
        </div>
    )
}


export default TaxistasPage