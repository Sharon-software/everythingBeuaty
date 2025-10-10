import React from 'react'
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const Bookings = () => {
 const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/salons/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch salons");
        return res.json();
      })
      .then((data) => {
        setSalons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading salons...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
    <div className="salondisplay">
      {salons.map((salon, index) => (
      <div key={index} className="salon-card">
      <div className="contain">
        <h2>{salon.salon_name}</h2>
        <p>Location: {salon.location}</p>
        <p>Start Time: {salon.startT}</p>
        <p>End Time: {salon.endT}</p>

        <div className="salon-gallery">
          <div className="salon-gallery-track">
          {salon.gallery.length > 0 ? (
            salon.gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${salon.salon_name} gallery ${i + 1}`}
                
                onClick={() => setSelectedImage(img)}
              />
            ))
          ) : (
            
          <p style={{
            fontSize: "4rem",
            color:'#ce6666ff',
            fontWeight:'bold',
           
          }}>
            No images available
            </p>
          )}
        </div>
        </div>
        <div className='booknow'>

        
       <button onClick ={()=> navigate("/BookService",{state:{salon}})}>Book Now</button> 
       <button onClick ={()=> navigate("/ViewMore")}>View More</button> 
      </div>

      </div>
      
      </div>
     ))}

  
     {selectedImage && (
     <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={() => setSelectedImage(null)}
    >
      <img
        src={selectedImage}
        alt="Selected"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  )}
  
</div>



  
  </>
  );
};


export default Bookings