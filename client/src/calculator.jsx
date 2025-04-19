import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCcw,
  Search,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import debounce from "lodash/debounce";

function Button({ children, onClick, size = "md", variant = "default", className = "" }) {
  const sizes = { icon: "p-2", md: "px-4 py-2" };
  const variants = {
    default: "bg-sky-500 text-white hover:bg-sky-600",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700",
    outline:
      "border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
    menu: "bg-transparent hover:border-2 hover:border-white transition-all duration-200",
    loading: "bg-gray-300 text-gray-500 cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} ${variants[variant]} rounded ${className}`}
      disabled={variant === "loading"}
    >
      {variant === "loading" ? <Loader2 className="animate-spin" /> : children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white dark:bg-gray-800 rounded-xl shadow ${className}`}>{children}</div>;
}

function CardContent({ children }) {
  return (
    <div className="w-full max-h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}

function Alert({ message, type = "error", onClose }) {
  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${
        type === "error"
          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
          : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-4 text-sm">×</button>
    </div>
  );
}

function Table() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState([]);
  const [searchInput, setSearchInput] = useState(""); // New state for raw search input
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tailNumber");
  const filterRef = useRef(null);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const menuItems = [
    { name: "Home", path: "/landing" },
    { name: "Flight Logs", path: "/details" },
    { name: "Cost Details", path: "/calculator" },
    { name: "Logout", path: "/" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const fetchFlights = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const cachedData = localStorage.getItem("flightCosts");
      if (cachedData) {
        setFlights(JSON.parse(cachedData));
      }
      const res = await axios.get("http://localhost:3001/flight-costs");
      console.log("API Response (/flight-costs):", res.data);
      const flightData = Array.isArray(res.data) ? res.data : [];
      setFlights(flightData);
      localStorage.setItem("flightCosts", JSON.stringify(flightData));
      setAlert({ message: "Data refreshed successfully!", type: "success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error("Error fetching flight costs:", err.message, err.response?.data);
      setAlert({ message: "Failed to refresh data.", type: "error" });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse search input to detect tail number, date, or status
  const parseSearchInput = (input) => {
    const filters = [];
    // Tail number pattern (e.g., VT-SBR)
    const tailNumberRegex = /[A-Z0-9]{4,6}|VT-[A-Z0-9]{3}/i;
    const tailMatch = input.match(tailNumberRegex);
    if (tailMatch) {
      filters.push({ field: "tailNumber", value: tailMatch[0] });
    }
    // Date pattern (e.g., June 18, 2024)
    const dateRegex = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i;
    const dateMatch = input.match(dateRegex);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate)) {
        filters.push({ field: "date", value: parsedDate.toISOString().split("T")[0] });
      }
    }
    // Status pattern (e.g., Completed, In Progress)
    const statusRegex = /completed|in progress/i;
    const statusMatch = input.match(statusRegex);
    if (statusMatch) {
      filters.push({ field: "status", value: statusMatch[0].toLowerCase() });
    }
    // If no specific matches, treat as general text search
    if (filters.length === 0 && input.trim()) {
      filters.push({ field: "text", value: input.trim() });
    }
    return filters;
  };

  // Debounced filter handler
  const debouncedSetFilter = useCallback(
    debounce((value) => {
      const parsedFilters = parseSearchInput(value);
      setFilters((prev) => {
        const nonTextFilters = prev.filter(
          (f) => f.field !== "tailNumber" && f.field !== "date" && f.field !== "status" && f.field !== "text"
        );
        return [...nonTextFilters, ...parsedFilters];
      });
    }, 100),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Update raw input state
    debouncedSetFilter(value); // Update filters with debounced parsing
  };

  // Handle filter selection
  const handleFilterSelect = (field, value) => {
    setFilters((prev) => {
      const existingFilter = prev.find((f) => f.field === field && f.value === value);
      if (existingFilter) {
        return prev.filter((f) => !(f.field === field && f.value === value));
      } else {
        return [...prev.filter((f) => f.field !== field), { field, value }];
      }
    });
    setIsFilterOpen(false);
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setFilters([]);
    setSearchInput(""); // Clear search input on reset
    setIsFilterOpen(false);
  };

  // Extract unique tail numbers, months, and statuses
  const uniqueTailNumbers = useMemo(
    () => [...new Set(flights.map((flight) => flight.tailNumber))],
    [flights]
  );
  const uniqueMonths = useMemo(
    () =>
      [
        ...new Set(
          flights.map((flight) =>
            new Date(flight.date).toLocaleString("default", { month: "long" })
          )
        ),
      ],
    [flights]
  );
  const uniqueStatuses = useMemo(
    () => [...new Set(flights.map((flight) => flight.status))],
    [flights]
  );

  // Memoized filtered flights
  const filteredLogs = useMemo(() => {
    let result = [...flights];
    if (filters.length > 0) {
      filters.forEach(({ field, value }) => {
        if (field === "tailNumber") {
          result = result.filter(
            (flight) => flight.tailNumber.toLowerCase() === value.toLowerCase()
          );
        } else if (field === "month") {
          result = result.filter(
            (flight) =>
              new Date(flight.date)
                .toLocaleString("default", { month: "long" })
                .toLowerCase() === value.toLowerCase()
          );
        } else if (field === "status") {
          result = result.filter(
            (flight) => flight.status.toLowerCase() === value.toLowerCase()
          );
        } else if (field === "date") {
          result = result.filter((flight) => flight.date === value);
        } else if (field === "text") {
          result = result.filter((flight) =>
            Object.values(flight).some(
              (val) => String(val || "").toLowerCase().includes(value.toLowerCase())
            )
          );
        }
      });
    }
    return result;
  }, [flights, filters]);

  // Handle Download as CSV
  const handleDownload = () => {
    try {
      const csv = [
        [
          "Date",
          "Tail Number",
          "Flight Hours",
          "Total Cost",
          "Status",
          "Flight School",
        ],
        ...filteredLogs.map((flight) =>
          [
            `"${flight.date.replace(/"/g, '""')}"`,
            `"${flight.tailNumber.replace(/"/g, '""')}"`,
            `"${flight.flightHours}"`,
            `"${flight.totalCost}"`,
            `"${flight.status.replace(/"/g, '""')}"`,
            `"${flight.school.replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flight_costs.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      setAlert({ message: "Download successful!", type: "success" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      console.error("Error downloading CSV:", err);
      setAlert({ message: "Failed to download data.", type: "error" });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const monthlyTotal = filteredLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
  const monthlyHours = filteredLogs.reduce((sum, log) => sum + (parseFloat(log.flightHours) || 0), 0);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
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
            <Button variant="ghost" className="mr-2" onClick={() => navigate("/landing")}>
              <ArrowLeft size={20} />
            </Button>
            <h2 className="text-2xl font-bold">Training Flight Cost Calculator</h2>
          </div>
          <div className="flex gap-2">
            <div className="relative group" ref={filterRef}>
              <Button
                size="icon"
                variant="outline"
                className="border border-gray-300"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter />
              </Button>
              {isFilterOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-10 p-4">
                  {/* Tabs */}
                  <div className="flex space-x-2 mb-4 border-b overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("tailNumber")}
                      className={`pb-2 px-2 ${
                        activeTab === "tailNumber"
                          ? "border-b-2 border-blue-500 text-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      } whitespace-nowrap`}
                    >
                      Tail Number
                    </button>
                    <button
                      onClick={() => setActiveTab("month")}
                      className={`pb-2 px-2 ${
                        activeTab === "month"
                          ? "border-b-2 border-blue-500 text-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      } whitespace-nowrap`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setActiveTab("status")}
                      className={`pb-2 px-2 ${
                        activeTab === "status"
                          ? "border-b-2 border-blue-500 text-blue-500"
                          : "text-gray-500 hover:text-gray-700"
                      } whitespace-nowrap`}
                    >
                      Status
                    </button>
                  </div>

                  {/* Options */}
                  <div className="overflow-x-auto pb-4 max-h-32">
                    {activeTab === "tailNumber" &&
                      uniqueTailNumbers.map((tailNumber) => (
                        <button
                          key={tailNumber}
                          onClick={() => handleFilterSelect("tailNumber", tailNumber)}
                          className={`inline-block px-2 py-1 m-1 bg-blue-100 text-gray-700 rounded-full text-sm hover:bg-blue-200 transition-colors ${
                            filters.some((f) => f.field === "tailNumber" && f.value === tailNumber)
                              ? "bg-blue-500 text-white"
                              : ""
                          }`}
                        >
                          {tailNumber}
                        </button>
                      ))}
                    {activeTab === "month" &&
                      uniqueMonths.map((month) => (
                        <button
                          key={month}
                          onClick={() => handleFilterSelect("month", month)}
                          className={`inline-block px-2 py-1 m-1 bg-blue-100 text-gray-700 rounded-full text-sm hover:bg-blue-200 transition-colors ${
                            filters.some((f) => f.field === "month" && f.value === month)
                              ? "bg-blue-500 text-white"
                              : ""
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    {activeTab === "status" &&
                      uniqueStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleFilterSelect("status", status)}
                          className={`inline-block px-2 py-1 m-1 bg-blue-100 text-gray-700 rounded-full text-sm hover:bg-blue-200 transition-colors ${
                            filters.some((f) => f.field === "status" && f.value === status)
                              ? "bg-blue-500 text-white"
                              : ""
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={handleResetFilter}
                      className="border border-gray-300"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {filters.length > 0 ? "Clear Filters" : "Filter"}
              </span>
            </div>
            <div className="relative group">
              <Button
                size="icon"
                variant={loading ? "loading" : "outline"}
                className="border border-gray-300"
                onClick={handleDownload}
              >
                <Download />
              </Button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Download
              </span>
            </div>
            <div className="relative group">
              <Button
                size="icon"
                variant={loading ? "loading" : "outline"}
                className="border border-gray-300"
                onClick={fetchFlights}
              >
                <RefreshCcw />
              </Button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Refresh
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <Card className="mb-6 border-2 border-blue-500 p-4 w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-blue-700">{currentMonth} Summary</h3>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Monthly Report</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 dark:bg-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-black">Total Flight Hours</p>
              <p className="text-2xl font-bold">{monthlyHours.toFixed(1)} hrs</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-black">Total Cost</p>
              <p className="text-2xl font-bold">₹{monthlyTotal.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-black">Average Cost per Hour</p>
              <p className="text-2xl font-bold">₹{(monthlyHours ? (monthlyTotal / monthlyHours).toFixed(2) : 0)}</p>
            </div>
          </div>
        </Card>

        {/* Search Input */}
        <div className="mb-6 w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by tail number (e.g., VT-SBR), date (e.g., June 18, 2024), or status (e.g., Completed)"
              className="border p-2 rounded w-full pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* Table */}
        <Card className="w-full">
          <CardContent>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed text-sm text-left">
                <colgroup>
                  <col className="w-[20%]" /> {/* Date */}
                  <col className="w-[20%]" /> {/* Tail Number */}
                  <col className="w-[15%]" /> {/* Flight Hours */}
                  <col className="w-[15%]" /> {/* Total Cost */}
                  <col className="w-[15%]" /> {/* Status */}
                  <col className="w-[15%]" /> {/* Flight School */}
                </colgroup>
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 uppercase">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Tail Number</th>
                    <th className="p-3">Flight Hours</th>
                    <th className="p-3">Total Cost (₹)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Flight School</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-3 text-center text-gray-500">
                        <Loader2 className="animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap">{log.date}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                            {log.tailNumber}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{log.flightHours} hrs</td>
                        <td className="p-3 font-medium whitespace-nowrap">₹{log.totalCost.toLocaleString()}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              log.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : log.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{log.school}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-3 text-center text-gray-500">
                        No flights available or no matches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 w-full">
          <p className="text-sm text-gray-500">Showing {filteredLogs.length} of {flights.length} entries</p>
          <div className="flex gap-2">
            <Button variant="outline" className="text-sm">Previous</Button>
            <Button variant="outline" className="text-sm bg-blue-50">1</Button>
            <Button variant="outline" className="text-sm">Next</Button>
          </div>
        </div>
      </div>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
    </div>
  );
}

export default Table;