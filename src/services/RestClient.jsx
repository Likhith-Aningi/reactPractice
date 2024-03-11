import axios from "axios";
const apiUrl = import.meta.env.VITE_BASE_URL; // Replace with your actual API base URL

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

const RestClient = {
  get: async (url, params = {}, headers = {}) => {
    try {
      const response = await axiosInstance.get(url, { params, headers });
      return response.data;
    } catch (error) {
      // Handle errors here (e.g., console.error or throw error)
      console.error("Error fetching data:", error);
    }
  },
  post: async (url, data = {}, headers = {}) => {
    try {
      const response = await axiosInstance.post(url, data, { headers });
      return response.data;
    } catch (error) {
      // Handle errors here
      console.error("Error posting data:", error);
    }
  },
  put: async (url, data = {}, headers = {}) => {
    try {
      const response = await axiosInstance.put(url, data, { headers });
      return response.data;
    } catch (error) {
      // Handle errors here
      console.error("Error updating data:", error);
    }
  },
  delete: async (url, params = {}, headers = {}) => {
    try {
      const response = await axiosInstance.delete(url, { params, headers });
      return response.data;
    } catch (error) {
      // Handle errors here
      console.error("Error deleting data:", error);
    }
  },
};

export default RestClient;
