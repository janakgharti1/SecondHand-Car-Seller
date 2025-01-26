import React, { useEffect, useState } from "react";

const Welcome = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUserName(name || "Guest");
  }, []);

  return (
    <div className="welcome-container">
      <h3 className="welcome-message">Welcome, {userName}!</h3>
    </div>
  );
};

export default Welcome;
