import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { userInfo, setUserInfo } = useUser();
  const navigate = useNavigate();

  const handleLogOut = () => {
    setUserInfo({
      isAuthenticated: false,
    });
    localStorage.removeItem("userInfo");

    navigate("/login");
  };

  return (
    <nav className="bg-gray-600 text-white flex items-center justify-between px-10 py-8 shadow-md">
      <div className="text-xl font-semibold">Sensor Dashboard</div>

      <div className="flex items-center space-x-6">
        {userInfo ? (
          <>
            <span className="text-sm">
              Hello, <span className="font-semibold">{userInfo.username}</span>
            </span>
            <button
              onClick={handleLogOut}
              className="bg-white text-gray-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
