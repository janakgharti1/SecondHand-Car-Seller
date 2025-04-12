import React, { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DEFAULT_IMAGE = "/api/placeholder/400/320";

const Dashboard = () => {
  const [userUID, setUserUID] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalCars: 0,
    soldCars: 0,
    activeCars: 0,
    carsByMonth: {},
    recentUploads: [],
    viewStatistics: {
      totalViews: 0,
      weeklyViews: 0,
      mostViewedCar: null
    },
    allCars: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('/');
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_IMAGE;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
        setDashboardData({
          totalCars: 0,
          soldCars: 0,
          activeCars: 0,
          carsByMonth: {},
          recentUploads: [],
          viewStatistics: {
            totalViews: 0,
            weeklyViews: 0,
            mostViewedCar: null
          },
          allCars: []
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!userUID) return;

    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get("http://localhost:4000/api/cars/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allCars = response.data.map(car => {
        let validImages = Array.isArray(car.images) && car.images.length > 0 
          ? car.images.filter(img => isValidImageUrl(img))
          : [];
          
        if (validImages.length === 0) {
          validImages = [DEFAULT_IMAGE];
        }
        
        return {
          ...car,
          createdAt: new Date(car.createdAt || Date.now()),
          images: validImages,
          views: car.views || 0
        };
      });

      if (allCars.length === 0) {
        setDashboardData(d => ({
          ...d,
          allCars: [],
          totalCars: 0,
          soldCars: 0,
          activeCars: 0
        }));
        setIsLoading(false);
        return;
      }

      const totalCars = allCars.length;
      const soldCars = allCars.filter(car => car.sold === true).length;
      const activeCars = totalCars - soldCars;
      const totalViews = allCars.reduce((sum, car) => sum + (car.views || 0), 0);
      const weeklyViews = Math.floor(totalViews * 0.4);
      
      const mostViewedCar = allCars.length > 0 
        ? allCars.reduce((prev, current) => 
            (prev.views || 0) > (current.views || 0) ? prev : current
          )
        : null;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const carsByMonth = {};
      months.forEach(month => {
        carsByMonth[month] = 0;
      });
      
      allCars.forEach(car => {
        const date = new Date(car.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        carsByMonth[month] += 1;
      });

      const recentUploads = allCars
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5);

      setDashboardData({
        totalCars,
        soldCars,
        activeCars,
        carsByMonth,
        recentUploads,
        viewStatistics: {
          totalViews,
          weeklyViews,
          mostViewedCar
        },
        allCars
      });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userUID]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const chartData = {
    labels: Object.keys(dashboardData.carsByMonth),
    datasets: [
      {
        label: "Cars Uploaded",
        data: Object.values(dashboardData.carsByMonth),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(75, 192, 192, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: "Car Uploads by Month",
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        },
        title: {
          display: true,
          text: "Number of Cars",
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Your Dashboard</h2>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Cars Uploaded</h3>
          <p className="summary-value">{dashboardData.totalCars}</p>
        </div>
        <div className="summary-card">
          <h3>Sold Cars</h3>
          <p className="summary-value">{dashboardData.soldCars}</p>
        </div>
        <div className="summary-card">
          <h3>Active Listings</h3>
          <p className="summary-value">{dashboardData.activeCars}</p>
        </div>
        <div className="summary-card">
          <h3>Total Views</h3>
          <p className="summary-value">{dashboardData.viewStatistics.totalViews}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stats-card">
          <h3>Weekly Performance</h3>
          <div className="stats-content">
            <div className="stat-item">
              <span className="stat-label">Views This Week</span>
              <span className="stat-value">{dashboardData.viewStatistics.weeklyViews}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Conversion Rate</span>
              <span className="stat-value">
                {dashboardData.totalCars > 0 
                  ? `${Math.round((dashboardData.soldCars / dashboardData.totalCars) * 100)}%` 
                  : "0%"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <h3>Most Viewed Car</h3>
          {dashboardData.viewStatistics.mostViewedCar ? (
            <div className="most-viewed-car">
              <h4>{dashboardData.viewStatistics.mostViewedCar.carName || "Unnamed Vehicle"}</h4>
              <p>{dashboardData.viewStatistics.mostViewedCar.brand || "Unknown"} • {dashboardData.viewStatistics.mostViewedCar.carYear || "N/A"}</p>
              <p><strong>{dashboardData.viewStatistics.mostViewedCar.views || 0}</strong> views</p>
            </div>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>

      <div className="recent-uploads">
        <h3>Recent Uploads</h3>
        {dashboardData.recentUploads.length > 0 ? (
          <div className="uploads-list">
            {dashboardData.recentUploads.map((car) => (
              <div key={car._id} className="upload-item">
                <div className="upload-image">
                  <img
                    src={
                      car.featuredImage
                        ? `http://localhost:4000/uploads/${car.featuredImage}`
                        : car.images[0] || "https://via.placeholder.com/100x75?text=No+Image"
                    }
                    alt={car.carName}
                    onError={handleImageError}
                  />
                </div>
                <div className="upload-details">
                  <p className="upload-title">{car.carName || "Unnamed Vehicle"}</p>
                  <p className="upload-subtitle">
                    {car.brand || "Unknown"} • {car.carYear || "N/A"} • 
                    ₹{(car.price || 0).toLocaleString()}
                  </p>
                  <p className="upload-date">
                    Uploaded: {car.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span className={`status-badge ${car.sold ? "sold" : "available"}`}>
                  {car.sold ? "Sold" : "Available"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-uploads">
            <p>No recent uploads</p>
            <p className="no-uploads-subtitle">
              Start adding cars to see them appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;