import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { collection, onSnapshot, updateDoc, doc, deleteDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    role: "User"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (id, role) => {
    if (role !== "Admin" && role !== "User") return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", id), { role });
      setSuccess("User role updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update user role");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", id));
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!newUser.name.trim() || !newUser.email || !newUser.password || !newUser.dob || !newUser.gender) {
      setError("All fields are required.");
      return;
    }

    if (!newUser.email.endsWith("@gmail.com")) {
      setError("Email must be a valid @gmail.com address.");
      return;
    }

    if (
      newUser.password.length < 8 ||
      !/[A-Z]/.test(newUser.password) ||
      !/[0-9]/.test(newUser.password) ||
      !/[@$!%*?&#]/.test(newUser.password)
    ) {
      setError("Password must be at least 8 characters, include an uppercase letter, a number, and a special character.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob,
        gender: newUser.gender,
        role: newUser.role,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });

      setNewUser({ name: "", email: "", password: "", dob: "", gender: "", role: "User" });
      setSuccess("User added successfully and verification email sent");
      setIsFormVisible(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding user:", error);
      setError(`Failed to add user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    if (!isFormVisible) {
      setNewUser({ name: "", email: "", password: "", dob: "", gender: "", role: "User" });
      setError("");
    }
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>User Management</h2>
        <button className="add-toggle-btn" onClick={toggleForm}>
          {isFormVisible ? "Cancel" : "Add New User"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading && <div className="loading-indicator">Processing...</div>}

      {isFormVisible && (
        <div className="form-container">
          <form onSubmit={handleAddUser} className="add-user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={newUser.dob}
                  onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select 
                  id="gender"
                  value={newUser.gender} 
                  onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })} 
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="role">User Role</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => user.name.toLowerCase().includes(search.toLowerCase()))
              .map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.gender}</td>
                  <td>
                    <select
                      className={`role-select ${user.role === "Admin" ? "admin-role" : "user-role"}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(user.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;