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
      await updateDoc(doc(db, "users", id), { role });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");

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
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleAddUser} className="add-user-form">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
        />
        <select value={newUser.gender} onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Prefer not to say">Others</option>
        </select>
        <input
          type="date"
          placeholder="Date of Birth"
          value={newUser.dob}
          onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
          required
        />
        <div className="role-button-container">
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit">Add User</button>
        </div>
      </form>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
