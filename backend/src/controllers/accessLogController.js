import accessLogModel from "../models/accessLogModel.js";

const accessLogController = {
    async getAccessLogs(req, res) {
        try {
            const logs = await accessLogModel.getAccessLogs();
            res.status(200).json({ success: true, logs });
        } catch (error) {
            console.error("Error fetching access logs:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
};

export default accessLogController;
