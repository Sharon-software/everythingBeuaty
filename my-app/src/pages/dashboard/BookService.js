import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import axiosInstance from "../../Axiosinstance";

const BookService = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSalon = location.state?.salon || null;
  const token = localStorage.getItem("accessToken");

  const handleConfirm = async () => {
    if (!dateTime) {
      alert("Please select  date and time!");
      return;
    }

    const selected = new Date(dateTime);
    const now = new Date();

    if (selected < now) {
      alert("Cannot choose a past date and time!");
       
      return;
    }

    // Check time within salon working hours
    if (selectedSalon) {
      const [startHour, startMinute] = selectedSalon.startT.split(":").map(Number);
      const [endHour, endMinute] = selectedSalon.endT.split(":").map(Number);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      const selectedTotal = selected.getHours() * 60 + selected.getMinutes();

      if (selectedTotal < startTotal || selectedTotal > endTotal) {
        alert(`Please choose a time between ${selectedSalon.startT} and ${selectedSalon.endT}`);
        return;
      }
    }

    try {
      const serviceObj = selectedSalon.services_list.find(
        (s) => s.service_name === selectedService
      );

      // Send POST request to backend
      await axiosInstance.post("/bookings/", {
        salon_id: selectedSalon.id,
        service_name: selectedService,
        date_time: dateTime,
        price: serviceObj?.price || 0,
       
      },
      {
         headers: {
          Authorization: `Bearer ${token}`,
      }
    }
      
    );

      alert(
      `Booking confirmed for ${selectedService} at ${selectedSalon?.salon_name} on ${selected.toLocaleString()}`
    );

      navigate("/dashboard"); 
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      alert("Failed to save booking.");
    }
  };

  return (
    <>
    <div className="Background">
      <div className="bookservice">
        <h2>Book at {selectedSalon?.salon_name}</h2>
        <p>Location: {selectedSalon?.location}</p>
        <p>Working hours: {selectedSalon?.startT} - {selectedSalon?.endT}</p>

       <label> Choose Time and date
        <button onClick={() => setShowPicker(!showPicker)}>
          Select Date & Time
        </button>
        </label>

        {showPicker && (
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            min={new Date().toISOString().slice(0,16)}
          />
        )}

       
       <div className="ServiceChoose">
       <label>Choose service
        {selectedSalon && (
          
            
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Choose service</option>
              {selectedSalon.services_list.map((service, index) => (
                <option key={index} value={service.service_name}>
                  {service.service_name} - R{service.price}
                </option>
              ))}
            </select>
        )}</label>
          </div>
        

        {selectedService && (
          <p>
            You want your <strong>{selectedService}</strong> at{" "}
            <strong>{selectedSalon?.salon_name}</strong> on{" "}
            <strong>{new Date(dateTime).toLocaleString()}</strong>
          </p>
        )}
      </div>
      
      <div className="Confirm">
      <button onClick={handleConfirm}>Confirm Booking</button>
      </div>
      </div>
    </>
  );
};

export default BookService;
