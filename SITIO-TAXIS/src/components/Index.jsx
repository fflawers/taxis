import React, {Fragment} from "react";
import Banner from "./Banner/Banner"
import Formulario from "./Formularios/Formulario";


export default function Index() {
    return (
        <Fragment>
            <Banner titleB={"Bienvenido"}/>
            <Formulario/>
        </Fragment>

    )
}