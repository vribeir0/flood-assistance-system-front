import axios from "axios";

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createEventSource = (message: string): EventSource => {
  const queryString = `?message=${message}`;
  const eventSource = new EventSource(`${API_URL}/chat${queryString}`);
  return eventSource;
};
