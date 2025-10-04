import React, {Fragment} from "react";
import Banner from "./Banner/Banner"
import Formulario from "./Formularios/Formulario";
import IndexFooter from "./Footers/IndexFooter";


export default function Index() {
    return (
        <Fragment>
            <Banner titleB={"Bienvenido"}/>
            <Formulario/>
            <IndexFooter/>
        </Fragment>

    )
}