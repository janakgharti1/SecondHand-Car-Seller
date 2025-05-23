const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Check if Firebase app is already initialized to prevent multiple initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shcs-5b6c5.firebaseio.com", 
  });
}

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Debug: log token contents (but hide sensitive info)
    // console.log("Auth token decoded:", {
    //   uid: decodedToken.uid,
    //   email: decodedToken.email,
    //   available_fields: Object.keys(decodedToken)
    // });
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase authentication error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticateUser };