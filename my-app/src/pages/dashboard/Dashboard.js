import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../Axiosinstance';
import { AuthProvider } from '../../AuthContext';
import axiosInstance from '../../Axiosinstance';

const Dashboard = () => {
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const { isLoggedIn } = useContext(AuthProvider);
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editData, setEditData] = useState({ service_name: "", date_time: "" });
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showCustomerBookings, setShowCustomerBookings] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await AxiosInstance.get('/details/');
        setFirstname(response.data.first_name || "");
        setEmail(response.data.email || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/salons/");
        if (!res.ok) throw new Error("Failed to fetch salons");
        const data = await res.json();
        setSalons(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    if (email) fetchSalons();
  }, [email]);


   const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get("/bookings/");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
  useEffect(() => {
   
    if (email) fetchBookings();
  }, [email]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  
  const userSalons = salons.filter(salon => salon.owner === email);
  const myBookings = bookings
    .filter(b => b.customer_email === email)
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  const salonCustomerBookings = bookings
    .filter(b => userSalons.some(salon => salon.salon_name === b.salon_name))
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  
  const handleApprove = async (bookingId) => {
  try {
    await axiosInstance.patch(`/bookings/${bookingId}/`, { status: 'approved' });
    fetchBookings();
  } catch (err) {
    console.error(err);
  }
};

const handleDecline = async (bookingId) => {
  try {
     await axiosInstance.patch(`/bookings/${bookingId}/`, { status: 'declined' });
    fetchBookings();
  } catch (err) {
    console.error(err);
  }
};

//cancelling booking
const handleCancel = async (bookingId) => {
  if (!window.confirm("Are you sure you want to cancel this booking?")) return;
  try {
    await axiosInstance.patch(`/bookings/${bookingId}/`, { status: 'cancelled' });
    fetchBookings(); 
  } catch (err) {
    console.error(err);
    alert("Failed to cancel booking. Try again later.");
  }
};

//handler to open edit mode
const handleEdit = (booking) => {
  setEditingBooking(booking.id);
  setEditData({
    service_name: booking.service_name,
    date_time: booking.date_time.split(".")[0], // format safely for datetime-local
  });
};
//handle to save edit
const handleSaveEdit = async () => {
  try {
    await axiosInstance.patch(`/bookings/${editingBooking}/`, {
      service_name: editData.service_name,
      date_time: editData.date_time,
      status: 'pending', // reset status so owner can approve again
    });
    setEditingBooking(null);
    fetchBookings();
  } catch (err) {
    console.error(err);
    alert("Failed to update booking.");
  }
};



  return (
    <div className="WelcomeMessage">
      <label>Welcome {firstname}</label>

      {userSalons.length > 0 && (
        <div className="UserSalonInfo">
          <h4 style={{
            fontSize: "1.5rem",
            color:'#b2c0b2ff',
            fontWeight:'bold',
            textAlign:'center'
          }}>
            You have {userSalons.length} salon(s) registered.
          </h4>
          <p style={{
            fontSize: "1.2rem",
            color:'#b2c0b2ff',
            fontWeight:'bold',
          }}>You also have {salonCustomerBookings.length} customer booking(s) waiting.</p>
        </div>
      )}

     
      <div style={{ marginBottom: "12px" }}>
        
        <button
          onClick={() => setShowMyBookings(!showMyBookings)}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            backgroundColor: "#dcc5dfff",
            border: "none",
            cursor: "pointer",
            color: "purple",
            marginRight: "10px",
          }}
        >
          {showMyBookings ? "Hide My Bookings" : "Show My Bookings"}
        </button>

        
        {userSalons.length > 0 && (
          <button
            onClick={() => setShowCustomerBookings(!showCustomerBookings)}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              backgroundColor: "#dcc5dfff",
              border: "none",
              cursor: "pointer",
              color: "purple",
            }}
          >
            {showCustomerBookings ? "Hide Customer Bookings" : "Show Customer Bookings"}
          </button>
        )}
      </div>

     
      {showMyBookings && (
        <div className="booking-list">
          {myBookings.length === 0 ? (
            <p>You have no upcoming bookings.</p>
          ) : (
            myBookings.map((b, i) => (
              <div key={i} className="book-card" style={{
                backgroundColor: "rgb(235, 147, 213)",
                borderRadius: "10px",
                width: "30%",
                padding: "15px",
                marginBottom: "10px"
              }}>
                <p><strong>Salon:</strong> {b.salon_name}</p>
                <p><strong>Service:</strong> {b.service_name}</p>
                <p><strong>Date:</strong> {new Date(b.date_time).toLocaleString()}</p>
                <p><strong>Price:</strong> R{b.price}</p>
               <p>
                <strong>Status:</strong>{" "}
                <span style={{
                color: b.status === "approved" ? "green" : b.status === "declined" ? "red" : "purple",
                fontWeight: "bold"
               }}>
               {b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending"}
               </span>
                </p>

  <div className="Customer">
  <button onClick={() => handleCancel(b.id)}>Cancel</button> 
  
  {editingBooking === b.id ? (
    <div style={{ marginTop: "10px" }}>
      <input
        type="text"
        placeholder="Service Name"
        value={editData.service_name}
        onChange={(e) => setEditData({ ...editData, service_name: e.target.value })}
      />
      <input
        type="datetime-local"
        value={editData.date_time}
        onChange={(e) => setEditData({ ...editData, date_time: e.target.value })}
      />
      <button onClick={handleSaveEdit}>Save</button>
      <button onClick={() => setEditingBooking(null)}>Cancel Edit</button>
    </div>
  ) : (
    <button onClick={() => handleEdit(b)}>Edit</button>
  )}
</div>

              </div>
            ))
          )}
        </div>
      )}

      {showCustomerBookings && (
        <div className="booking-list">
          {salonCustomerBookings.length === 0 ? (
            <p>No customer bookings yet.</p>
          ) : (
            salonCustomerBookings.map((b, i) => (
              <div key={i} className="book-card" style={{
                backgroundColor: "rgb(235, 147, 213)",
                borderRadius: "10px",
                width: "30%",
                padding: "15px",
                marginBottom: "10px"
              }}>
                <p><strong>Salon:</strong> {b.salon_name}</p>
                <p><strong>Service:</strong> {b.service_name}</p>
                <p><strong>Date:</strong> {new Date(b.date_time).toLocaleString()}</p>
                <p><strong>Price:</strong> R{b.price}</p>
                <p><strong>Customer Name:</strong> {b.customer_name}</p>
                <p><strong>Customer Email:</strong> {b.customer_email}</p>
                <p>
                <strong>Status:</strong>{" "}
                <span style={{
                color: b.status === "approved" ? "green" : b.status === "declined" ? "red" : "purple",
                fontWeight: "bold"
                 }}>
                  {b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending"}
                </span>
                 </p>

                

                <div  className='BookingApproval'>
                {b.status === 'pending' && (
                 <>
                 <button onClick={() => handleApprove(b.id)}>Accept</button>
                 <button onClick={() => handleDecline(b.id)}>Decline</button>
                 </>
                 )}
                
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <h3>
        <label onClick={() => navigate("/RegSalon")}>REGISTER</label> your salon
        <br /> OR <br />
        <label onClick={() => navigate("/Book")}>BOOK</label> your next appointment
      </h3>
    </div>
  );
};

export default Dashboard;
