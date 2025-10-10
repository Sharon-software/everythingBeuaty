import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../../Axiosinstance';

const Regsalon = () => {
  const [salonName, setSalonName] = useState("");
  const [Location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [Gallery, setGallery] = useState([]);
  const [services, setServices] = useState([{ service_name: "", price: "" }]);
  const [error, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  
  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { service_name: "", price: "" }]);
  };

  const removeService = (index) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     setErrors({});
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No token found. Please login first.");
      return;
    }

    const formData = new FormData();
    formData.append("salon_name", salonName);
    formData.append("location", Location);
    formData.append("startT", startTime);
    formData.append("endT", endTime);
    
    const filteredServices = services.filter(s => s.service_name && s.price);
    formData.append("services", JSON.stringify(filteredServices));


    for (let i = 0; i < Gallery.length; i++) {
      formData.append("gallery_upload", Gallery[i]);
    }
  


    try {
      const response = await axiosInstance.post(
        "http://127.0.0.1:8000/api/v1/salons/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Salon registered", response.data);
      setErrors({});
      setSuccess(true);
      navigate('/Dashboard');
    } catch (err) {
      console.error("Registration error", err.response?.data);
      setErrors(err.response?.data || {});
    }
  };

  return (
    <div className='salonReg'>
      <form onSubmit={handleSubmit}>
        <h3>Enter your Salon details below</h3>

        <label>
          Salon Name
          <input
            type="text"
            placeholder="Enter salon Name"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            required
          /><br/>
        </label>
        {error.salon_name && <div style={{ color: "red" }}>{error.salon_name}</div>}

        <label>
          Location
          <input
            type="text"
            placeholder="Enter your location"
            value={Location}
            onChange={(e) => setLocation(e.target.value)}
            required
          /><br/>
        </label>
         {error.location && <div style={{ color: "red" }}>{error.location}</div>}

        <label>
          Working hours start from: 
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          /> 
          To 
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)
            }
          />
        </label><br/>


        <label>Add pictures to your Gallery:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setGallery(e.target.files)}
        /><br/>

        <h4 style={{
          color: "#080808ff",
          fontSize: "2rem",
          fontWeight:"unset",
        }}>
           Add your Services & Prices</h4>

        {services.map((service, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Service Name"
              value={service.service_name}
              onChange={(e) => handleServiceChange(index, "service_name", e.target.value)}
            />
             
           
            <input
              type="text"
              placeholder="Price"
              value={service.price}
              onChange={(e) => handleServiceChange(index, "price", e.target.value)}
            />
             

            <button style={{
              
              marginBottom:"1rem",
            }} 
            type="button" onClick={() => removeService(index)}>Remove Service</button>
          </div>
        ))}
        <button type="button" onClick={addService}>Add Service</button><br/><br/>

        <button type="submit">Submit</button>

        {success && (
          <div className="alert alert-success">
            <span style={{ color: "darkgreen",
                          fontWeight: "bold"
                         }}>Registration Successful!
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Regsalon;
