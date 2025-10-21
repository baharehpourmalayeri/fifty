export const protectedFetch = async (
  userInfo,
  url,
  options = {},
  unauthorizedCallback = null
) => {
  const token = userInfo?.access_token;

  const res = await fetch("http://localhost:8000" + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("userInfo");

    if (unauthorizedCallback) {
      unauthorizedCallback();
    }
    return null;
  }

  const data = res.status != 204 ? await res.json() : "No Content";
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
};

export const unprotectedFetch = async (url, options = {}) => {
  const res = await fetch("http://localhost:8000" + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
};
