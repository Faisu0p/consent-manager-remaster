import api from "./api";

const accessLogService = {
  async getAccessLogs() {
    try {
      const response = await api.get("/access-logs");
      return response.data.logs; // <-- Extract logs array
    } catch (error) {
      console.error("Error fetching access logs:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default accessLogService;
