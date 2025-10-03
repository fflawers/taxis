import React from "react";

const Banner = ({ imgA, imgB, titleB, subtitleB }) => {
  return (
    <div className="container-fluid p-0 m-0 bannersGeneral ">
      <div className="p-0 m-0 josepo24 spaceNavbar text-center">
        <div className="p-0 m-0 boxTitleR text-black">
          <p className="p-0 titleI">
            <span className="p-0 m-0 ptittleRec"
              dangerouslySetInnerHTML={{ __html: titleB ? titleB : "Recarga" }} ></span>{" "}
            <br /> Fácil, rápido y sin <br /> complicaciones
          </p>
        </div>
        <img
          src={
            imgB
              ? imgB
              : "https://proyectotaxis.s3.us-east-2.amazonaws.com/iconotaxi.png" }
          className="p-0 lusitoIMgR"
          alt=""
        />
      </div>
    </div>
  );
};

export default Banner;
