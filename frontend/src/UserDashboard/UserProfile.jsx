import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../UserDashboard/UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUserData = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "user", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          localStorage.setItem("userName", userDoc.data().name); // Sync name with localStorage
        } else {
          setError("User data not found.");
        }
      } else {
        setError("No user is logged in.");
      }
    } catch (err) {
      setError("Failed to fetch user data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "user", user.uid), userData);
        localStorage.setItem("userName", userData.name); // Update localStorage when saving changes
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError("No user is logged in.");
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="profile-form">
        <label>
          Full Name
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={userData.email}
            disabled // Email should not be editable
          />
        </label>
        <label>
          Gender
          <select
            name="gender"
            value={userData.gender}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Others</option>
          </select>
        </label>
        <label>
          Date of Birth
          <input
            type="date"
            name="dob"
            value={userData.dob}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </label>
        <div className="profile-buttons">
          {isEditing ? (
            <>
              <button onClick={handleSaveChanges} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
