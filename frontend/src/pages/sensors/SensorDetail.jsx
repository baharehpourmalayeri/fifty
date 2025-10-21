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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {sensor.name} ({sensor.model})
      </h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Add Reading</h2>
        <form onSubmit={handleAddReading} className="space-x-2">
          <input
            type="number"
            step="0.1"
            placeholder="Temperature"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Humidity"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="border px-2 py-1 rounded"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </form>
      </div>
      <div className="mb-2">
        <input
          type="datetime-local"
          placeholder="Time From"
          value={timeFrom}
          onChange={(e) => setTimeFrom(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <input
          type="datetime-local"
          placeholder="Time To"
          value={timeTo}
          onChange={(e) => setTimeTo(e.target.value)}
          className="border px-2 py-1 rounded mr-2"
        />
        <button
          type="button"
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => fetchData()}
        >
          Filter
        </button>
      </div>
      <div>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SensorDetail;
