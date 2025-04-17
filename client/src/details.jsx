import { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronLeft, ChevronRight, Filter, Download, RefreshCcw, Search, ArrowLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

function Button({ children, onClick, size = "md", variant = "default", className = "" }) {
  const sizes = { icon: "p-2", md: "px-4 py-2" };
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    ghost: "bg-transparent hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    menu: "bg-transparent hover:border-2 hover:border-white transition-all duration-200"
  };

  return (
    <button onClick={onClick} className={`${sizes[size]} ${variants[variant]} rounded ${className}`}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl shadow w-full ${className}`}>{children}</div>;
}

function CardContent({ children }) {
  return <div className="w-full">{children}</div>;
}

function FlightTrackingTable() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [flights, setFlights] = useState([]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const menuItems = [
    { name: "Home", path: "/landing" },
    { name: "Flight Logs", path: "/details" },
    { name: "Cost Details", path: "/calculator" },
    { name: "Logout", path: "/" }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await axios.get("http://localhost:3001/flights");
        const flightLogs = res.data;

        // Format each log entry
        const formatted = flightLogs.map((log) => {
          const dateObj = new Date(log.timestamp);
          const date = dateObj.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
          const time = dateObj.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit"
          });

          return {
            date,
            tailNumber: log.tail_number,
            outboundTime: log.status === "departing" ? time : "—",
            inboundTime: log.status === "arriving" ? time : "—",
            duration: "—", // You can calculate this if you store both arrival and departure logs
            status: log.status,
            departureVideo: "Not Available",
            arrivalVideo: "Not Available"
          };
        });

        // Optional: sort by date/time descending
        const sorted = formatted.sort((a, b) => new Date(b.date + " " + b.outboundTime) - new Date(a.date + " " + a.outboundTime));

        setFlights(sorted);
      } catch (err) {
        console.error("Error fetching flight logs:", err);
      }
    };

    fetchFlights();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-[#1a2e44] text-white p-4 transition-all ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex items-center justify-between mb-10">
          {!collapsed && <h1 className="text-xl font-bold">Menu</h1>}
          <Button size="icon" variant="ghost" className="text-white" onClick={toggleSidebar}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <div>
          {menuItems.map((item, i) => (
            <Button
              key={i}
              variant="menu"
              className="w-full justify-start mb-4 text-white hover:bg-[#2a3e54]"
              onClick={() => handleMenuClick(item.path)}
            >
              {!collapsed && item.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 w-full max-w-full">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-2" onClick={() => navigate('/landing')}>
                <ArrowLeft size={20} />
              </Button>
              <h2 className="text-2xl font-bold">Flight Logs</h2>
            </div>
            <div className="flex gap-2">
              {/* Filter */}
              <div className="relative group">
                <Button size="icon" variant="outline"><Filter /></Button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition">
                  Filter
                </span>
              </div>
              {/* Download */}
              <div className="relative group">
                <Button size="icon" variant="outline"><Download /></Button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition">
                  Download
                </span>
              </div>
              {/* Refresh */}
              <div className="relative group">
                <Button size="icon" variant="outline"><RefreshCcw /></Button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition">
                  Refresh
                </span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="w-full mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by tail number, date..."
                className="border p-2 rounded w-full pl-10"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardContent>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12.5%]" />
                  <col className="w-[12.5%]" />
                  <col className="w-[10%]" />
                  <col className="w-[12.5%]" />
                  <col className="w-[12.5%]" />
                </colgroup>
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="p-3 text-left">DATE</th>
                    <th className="p-3 text-left">TAIL NUMBER</th>
                    <th className="p-3 text-left">OUTBOUND TIME</th>
                    <th className="p-3 text-left">INBOUND TIME</th>
                    <th className="p-3 text-left">DURATION</th>
                    <th className="p-3 text-left">STATUS</th>
                    <th className="p-3 text-left">DEPARTURE VIDEO</th>
                    <th className="p-3 text-left">ARRIVAL VIDEO</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 whitespace-nowrap">{flight.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                          {flight.tailNumber}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{flight.outboundTime}</td>
                      <td className="p-3 whitespace-nowrap">{flight.inboundTime}</td>
                      <td className="p-3 whitespace-nowrap">{flight.duration}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          flight.status === "Completed" ? "bg-green-100 text-green-800" : 
                          flight.status === "In Progress" ? "bg-blue-100 text-blue-800" : 
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {flight.departureVideo !== "Not Available" && flight.departureVideo !== "Pending" ? (
                          <a href={flight.departureVideo} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            View Video
                          </a>
                        ) : (
                          <span className="text-gray-500">{flight.departureVideo}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {flight.arrivalVideo !== "Not Available" && flight.arrivalVideo !== "Pending" ? (
                          <a href={flight.arrivalVideo} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                            View Video
                          </a>
                        ) : (
                          <span className="text-gray-500">{flight.arrivalVideo}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FlightTrackingTable;
