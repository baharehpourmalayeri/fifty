import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { protectedFetch } from "../../utils/fetch";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/Navbar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SensorDetail = () => {
  const { sensorId } = useParams();
  const { userInfo } = useUser();

  const [sensor, setSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({});
      if (timeFrom) {
        params.append("timestamp_from", timeFrom);
      }
      if (timeTo) {
        params.append("timestamp_to", timeTo);
      }

      const sensorData = await protectedFetch(
        userInfo,
        `/api/sensors/${sensorId}`
      );
      setSensor(sensorData);

      const readingsData = await protectedFetch(
        userInfo,
        `/api/sensors/${sensorId}/readings/?${params.toString()}`
      );
      setReadings(readingsData || []);
    } catch (err) {
      setError(err.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, [sensorId, userInfo]);

  const handleAddReading = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await protectedFetch(
        userInfo,
        `/api/sensors/${sensorId}/readings/`,
        {
          method: "POST",
          body: JSON.stringify({
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            timestamp,
          }),
        }
      );
      if (res) {
        setReadings([...readings, res]);
        setTemperature("");
        setHumidity("");
        setTimestamp("");
      }
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
  };

  if (!sensor) return <p>Loading sensor...</p>;

  // Prepare chart data
  const chartData = {
    labels: readings.map((r) => new Date(r.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Temperature (°C)",
        data: readings.map((r) => r.temperature),
        borderColor: "red",
        yAxisID: "y1",
      },
      {
        label: "Humidity (%)",
        data: readings.map((r) => r.humidity),
        borderColor: "blue",
        yAxisID: "y2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "°C" },
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "%" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <a
        href="/sensors"
        className="absolute top-32 z-50 text-black hover:text-gray-400 transition ml-14"
      >
        <FontAwesomeIcon icon={faAngleLeft} size="lg" />
      </a>
      <div className="m-8 mt-8 p-6 space-y-6">
        <h1 className="text-2xl font-bold mt-8">
          {sensor.name} ({sensor.model})
        </h1>

        {error && <p className="text-red-600">{error}</p>}

        <div className="bg-white">
          {/* Add Reading */}
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">Add Reading</h3>
            <form onSubmit={handleAddReading} className="flex flex-wrap gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Temperature"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="border px-3 py-2 rounded-md w-40"
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Humidity"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="border px-3 py-2 rounded-md w-40"
                required
              />
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="border px-3 py-2 rounded-md"
                required
              />
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition"
              >
                Add
              </button>
            </form>
          </div>

          {/* Filter */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-2 text-gray-700">Filter by Time</h3>
            <div className="flex flex-wrap gap-2">
              <input
                type="datetime-local"
                placeholder="From"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="datetime-local"
                placeholder="To"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="border px-3 py-2 rounded-md"
              />
              <button
                type="button"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition"
                onClick={() => fetchData()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* === Bottom Section: Chart === */}
        <div className="border border-gray-300 rounded-2xl shadow-sm bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Sensor Data Overview
          </h2>
          <div className="w-full max-w-6xl h-[600px] mx-auto">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDetail;
