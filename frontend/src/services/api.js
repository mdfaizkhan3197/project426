import axios from "axios";

const API = axios.create({
  baseURL: "https://project426-backend.onrender.com/api", // all endpoints under /api
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const login = (data) => API.post("/login/", data);
export const register = (data) => API.post("/register/", data);

// Expenses
export const getExpenses = () => API.get("/expenses/");
export const createExpense = (data) => API.post("/expenses/", data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}/update/`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}/`);

export default API;