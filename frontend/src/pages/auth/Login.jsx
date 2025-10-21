import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/UserContextSetup";
import { unprotectedFetch } from "../../utils/fetch";

const Login = () => {
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await unprotectedFetch("/api/auth/token/", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      setUserInfo({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        isAuthenticated: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      navigate("/sensors");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="text-green-500 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
