import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { protectedFetch } from "../../utils/fetch";

const SensorList = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Fetch sensors
  const fetchSensors = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: 5,
        q: query,
      });

      const data = await protectedFetch(
        userInfo,
        `/api/sensors?${params.toString()}`
      );

      setSensors(data.items || []);
      setHasNext(data.has_next);
      setHasPrevious(data.has_previous);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, [userInfo, page]);

  // Add sensor
  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await protectedFetch(userInfo, "/api/sensors/", {
        method: "POST",
        body: JSON.stringify({ name, model }),
      });
      if (res) {
        setSensors([...sensors, res]);
        setName("");
        setModel("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSensors();
  };

  const resetSearch = (e) => {
    setQuery("");
    setPage(1);
    handleSearch(e);
  };

  const handleDelete = async (sensor_id) => {
    try {
      const response = await protectedFetch(
        userInfo,
        `/api/sensors/${sensor_id}/`,
        {
          method: "DELETE",
        }
      );
      if (response) {
        alert("Successfully Deleted!");
      }

      fetchSensors();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-screen h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Sensors</h1>

      {/* Add Sensor Form */}
      <form onSubmit={handleAdd} className="mb-6 space-x-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </form>

      {/* Search Filter */}
      <form onSubmit={handleSearch} className="mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search by name or model"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Search
        </button>
        <button
          type="button"
          onClick={resetSearch}
          className="bg-gray-300 text-black px-3 py-1 rounded"
        >
          Reset
        </button>
      </form>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Sensor List */}
      <ul className="space-y-2">
        {sensors.length > 0 ? (
          sensors.map((sensor) => (
            <li
              key={sensor.id}
              className="flex justify-between items-center cursor-pointer p-2 border rounded hover:bg-gray-100"
            >
              <div onClick={() => navigate(`/sensors/${sensor.id}`)}>
                <div className="font-semibold">{sensor.name}</div>
                <div className="text-sm text-gray-600">{sensor.model}</div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(sensor.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <button
                  onClick={() => handleDelete(sensor.id)}
                  className={`px-3 py-1 rounded ${
                    hasNext ? "bg-red-500 text-white" : "bg-gray-200"
                  }`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No sensors found.</p>
        )}
      </ul>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          disabled={!hasPrevious}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded ${
            hasPrevious ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Previous
        </button>
        <span className="self-center">Page {page}</span>
        <button
          disabled={!hasNext}
          onClick={() => setPage((p) => p + 1)}
          className={`px-3 py-1 rounded ${
            hasNext ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SensorList;
