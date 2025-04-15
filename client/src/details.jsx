import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Filter, ArrowUpDown, Download,
  RefreshCcw, Plus, Search, ArrowLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

function Button({ children, onClick, size = "md", variant = "default", className = "" }) {
  const sizes = { icon: "p-2", md: "px-4 py-2" };
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    ghost: "bg-transparent hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50", // Added comma here
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
  const toggleSidebar = () => setCollapsed(!collapsed);

  // Define menu items with their corresponding routes
  const menuItems = [
    { name: "Home", path: "/landing" },
    { name: "Flight Logs", path: "/details" },
    { name: "Cost Details", path: "/calculator" },
    { name: "Logout", path: "/" }  // Assuming logout redirects to login page
  ];

  // Handle menu item click
  const handleMenuClick = (path) => {
    navigate(path);
  };

  // Sample flight data
  const flights = [
    { 
      date: "April 14, 2025", 
      tailNumber: "N12345", 
      outboundTime: "08:30 AM", 
      inboundTime: "10:15 AM", 
      status: "Completed", 
      departureVideo: "https://flight-videos.example.com/N12345-dep-20250414",
      arrivalVideo: "https://flight-videos.example.com/N12345-arr-20250414"
    },
    { 
      date: "April 14, 2025", 
      tailNumber: "N54321", 
      outboundTime: "09:45 AM", 
      inboundTime: "11:30 AM", 
      status: "Completed", 
      departureVideo: "https://flight-videos.example.com/N54321-dep-20250414",
      arrivalVideo: "https://flight-videos.example.com/N54321-arr-20250414"
    },
    { 
      date: "April 14, 2025", 
      tailNumber: "N78901", 
      outboundTime: "01:15 PM", 
      inboundTime: "03:00 PM", 
      status: "In Progress", 
      departureVideo: "https://flight-videos.example.com/N78901-dep-20250414",
      arrivalVideo: "Pending"
    },
    { 
      date: "April 14, 2025", 
      tailNumber: "N24680", 
      outboundTime: "02:30 PM", 
      inboundTime: "Scheduled 04:15 PM", 
      status: "Scheduled", 
      departureVideo: "Not Available",
      arrivalVideo: "Not Available"
    }
  ];

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
              <Button size="icon" variant="outline"><Filter /></Button>
              <Button size="icon" variant="outline"><ArrowUpDown /></Button>
              <Button size="icon" variant="outline"><Download /></Button>
              <Button size="icon" variant="outline"><RefreshCcw /></Button>
              <Button size="icon"><Plus /></Button>
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
        {/* Table - Fill remaining space */}
        <div className="flex-1 px-6 pb-6 overflow-auto w-full">
          <Card className="w-full">
            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[10%]" />
                    <col className="w-[15%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="p-3 text-left"><input type="checkbox" /></th>
                      <th className="p-3 text-left">DATE</th>
                      <th className="p-3 text-left">TAIL NUMBER</th>
                      <th className="p-3 text-left">OUTBOUND TIME</th>
                      <th className="p-3 text-left">INBOUND TIME</th>
                      <th className="p-3 text-left">STATUS</th>
                      <th className="p-3 text-left">DEPARTURE VIDEO</th>
                      <th className="p-3 text-left">ARRIVAL VIDEO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-3"><input type="checkbox" /></td>
                        <td className="p-3 whitespace-nowrap">{flight.date}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                            {flight.tailNumber}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{flight.outboundTime}</td>
                        <td className="p-3 whitespace-nowrap">{flight.inboundTime}</td>
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
    </div>
  );
}

export default FlightTrackingTable;
