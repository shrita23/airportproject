import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Filter, ArrowUpDown, Download,
  RefreshCcw, Plus, Search, Calendar, ArrowLeft
} from "lucide-react";

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

function Table() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
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

  const flightLogs = [
    { date: "2025-04-10", tailNumber: "VT-ABC", flightHours: 3.5, costPerHour: 8500, totalCost: 29750, school: "Sky Aviation" },
    { date: "2025-04-11", tailNumber: "VT-XYZ", flightHours: 2.0, costPerHour: 8500, totalCost: 17000, school: "Sky Aviation" },
    { date: "2025-04-12", tailNumber: "VT-ABC", flightHours: 4.5, costPerHour: 8500, totalCost: 38250, school: "Sky Aviation" },
    { date: "2025-04-13", tailNumber: "VT-DEF", flightHours: 1.5, costPerHour: 9200, totalCost: 13800, school: "Cloud Flyers" },
    { date: "2025-04-14", tailNumber: "VT-ABC", flightHours: 3.0, costPerHour: 8500, totalCost: 25500, school: "Sky Aviation" },
  ];

  // Calculate monthly summary
  const currentMonth = "April 2025";
  const monthlyTotal = flightLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const monthlyHours = flightLogs.reduce((sum, log) => sum + log.flightHours, 0);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white p-4 transition-all ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex items-center justify-between mb-10">
          {!collapsed && <h1 className="text-xl font-bold">Flight Cost Tracker</h1>}
          <Button size="icon" variant="menu" className="text-white" onClick={toggleSidebar}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
        <div>
          {menuItems.map((item, i) => (
            <Button 
              key={i} 
              variant="menu" 
              className="w-full justify-start mb-4 text-white"
              onClick={() => handleMenuClick(item.path)}
            >
              {!collapsed && item.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-auto w-full max-w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" className="mr-2" onClick={() => navigate('/landing')}>
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-2xl font-bold">Training Flight Cost Calculator</h2>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline"><Calendar /></Button>
            <Button size="icon" variant="outline"><Filter /></Button>
            <Button size="icon" variant="outline"><Download /></Button>
            <Button size="icon" variant="outline"><RefreshCcw /></Button>
            <Button size="icon"><Plus /></Button>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <Card className="mb-6 border-2 border-blue-500 p-4 w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-blue-700">{currentMonth} Summary</h3>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Monthly Report</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">Total Flight Hours</p>
              <p className="text-2xl font-bold">{monthlyHours.toFixed(1)} hrs</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">Total Cost</p>
              <p className="text-2xl font-bold">₹{monthlyTotal.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">Average Cost per Hour</p>
              <p className="text-2xl font-bold">₹{(monthlyTotal / monthlyHours).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
          <div className="relative flex-grow">
            <input type="text" placeholder="Search by tail number or school" className="border p-2 rounded w-full pl-10" />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          <div className="flex gap-2">
            <select className="border p-2 rounded">
              <option>All Schools</option>
              <option>Sky Aviation</option>
              <option>Cloud Flyers</option>
            </select>
            <select className="border p-2 rounded">
              <option>All Aircraft</option>
              <option>VT-ABC</option>
              <option>VT-XYZ</option>
              <option>VT-DEF</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="w-full">
          <CardContent>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed text-sm text-left">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead className="bg-gray-100 text-gray-700 uppercase">
                  <tr>
                    <th className="p-3"><input type="checkbox" /></th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Tail Number</th>
                    <th className="p-3">Flight Hours</th>
                    <th className="p-3">Cost Per Hour (₹)</th>
                    <th className="p-3">Total Cost (₹)</th>
                    <th className="p-3">Flight School</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flightLogs.map((log, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3"><input type="checkbox" /></td>
                      <td className="p-3 whitespace-nowrap">{log.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                          {log.tailNumber}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{log.flightHours.toFixed(1)} hrs</td>
                      <td className="p-3 whitespace-nowrap">₹{log.costPerHour.toLocaleString()}</td>
                      <td className="p-3 font-medium whitespace-nowrap">₹{log.totalCost.toLocaleString()}</td>
                      <td className="p-3 whitespace-nowrap">{log.school}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button className="text-blue-500 hover:text-blue-700">Edit</button>
                          <button className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 w-full">
          <p className="text-sm text-gray-500">Showing 5 of 5 entries</p>
          <div className="flex gap-2">
            <Button variant="outline" className="text-sm">Previous</Button>
            <Button variant="outline" className="text-sm bg-blue-50">1</Button>
            <Button variant="outline" className="text-sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;
