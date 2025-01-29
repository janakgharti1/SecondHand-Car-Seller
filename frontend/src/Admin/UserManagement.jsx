import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firestore instance
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import "./UserManagement.css"; 

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch users from Firestore in real-time
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Handle Verification
  const handleVerify = async (id) => {
    try {
      await updateDoc(doc(db, "users", id), { verified: true });
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  // Handle Role Change (Only Admin or User)
  const handleRoleChange = async (id, role) => {
    if (role !== "Admin" && role !== "User") return; // Prevent invalid roles
    try {
      await updateDoc(doc(db, "users", id), { role });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
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
            <th>Role</th>
            <th>Verified</th>
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
                <td>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>{user.verified ? "✔️" : "❌"}</td>
                <td>
                  {!user.verified && (
                    <button onClick={() => handleVerify(user.id)}>Verify</button>
                  )}
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
