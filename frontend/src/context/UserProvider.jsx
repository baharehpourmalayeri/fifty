import { useState, useEffect } from "react";
import { UserContext } from "./UserContextSetup";
import { unprotectedFetch } from "../utils/fetch";

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");
    return storedUser
      ? JSON.parse(storedUser)
      : {
          id: null,
          username: "",
          email: "",
          isAuthenticated: false,
          access_token: "", // store JWT token from backend
          refresh_token: "", // store refresh token from backend
        };
  });

  useEffect(() => {
    if (userInfo.isAuthenticated) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // refresh token every 20 seconds
      const delay = 20000;
      setInterval(() => {
        refreshToken();
      }, delay);
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [userInfo]);

  const refreshToken = async () => {
    const data = await unprotectedFetch(
      `/api/auth/refresh/?token=${userInfo.refresh_token}`,
      {
        method: "POST",
      }
    );

    if (data) {
      setUserInfo({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        isAuthenticated: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}
