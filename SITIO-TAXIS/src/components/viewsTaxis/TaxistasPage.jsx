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
            <h1 className="container">
                Hola, {user?.nombre}
            </h1>
            </div>
            <IndexFooter/>
        
        </div>
    )
}


export default TaxistasPage