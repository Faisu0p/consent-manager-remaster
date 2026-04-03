import dsrRequestModel from "../models/dsrRequestModel.js";

const dsrRequestController = {
    // Create a new DSR request
    async createDSRRequest(req, res) {
        try {
            const { user_id, request_type, reason } = req.body;

            if (!user_id || !request_type || !reason) {
                return res.status(400).json({ message: "All fields are required." });
            }

            const newRequest = await dsrRequestModel.createDSRRequest({
                user_id,
                request_type,
                reason
            });

            res.status(201).json({
                message: "DSR request created successfully.",
                data: newRequest
            });
        } catch (error) {
            console.error("Error creating DSR request:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    // Get all DSR requests
    async getAllDSRRequests(req, res) {
        try {
            const requests = await dsrRequestModel.getAllDSRRequests();
            res.status(200).json({ data: requests });
        } catch (error) {
            console.error("Error fetching DSR requests:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    // Get a DSR request by ID
    async getDSRRequestById(req, res) {
        try {
            const { id } = req.params;

            const request = await dsrRequestModel.getDSRRequestById(id);

            if (!request) {
                return res.status(404).json({ message: "DSR request not found." });
            }

            res.status(200).json({ data: request });
        } catch (error) {
            console.error("Error fetching DSR request:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    },

    // Get a DSR request by ID for customer support (with hardcoded user details)
    async getDSRRequestForSupportById(req, res) {
        try {
        const { id } = req.params;
        const request = await dsrRequestModel.getDSRRequestForSupportById(id);

        if (!request) {
            return res.status(404).json({ message: "DSR request not found" });
        }

        const response = {
            ...request,
            userDetails: {
            address: "123 Main St, Anytown",
            phoneNumber: "+1 (555) 123-4567",
            passportNumber: "AB1234567",
            dateOfBirth: "1985-06-15"
            }
        };

        res.json(response);
        } catch (error) {
        console.error("Error fetching DSR details:", error);
        res.status(500).json({ message: "Internal server error" });
        }
    },

    // Fetch all DSR requests for customer support
    async getAllDSRRequestsForSupport(req, res) {
        try {
            const requests = await dsrRequestModel.getAllDSRRequests();
        
            const response = requests.map(request => ({
                ...request,
                userDetails: {
                    address: "123 Main St, Anytown",
                    phoneNumber: "+1 (555) 123-4567",
                    passportNumber: "AB1234567",
                    dateOfBirth: "1985-06-15"
                }
            }));
        
            res.json({ data: response });
        } catch (error) {
            console.error("Error fetching all DSR requests for customer support:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },


    // Update DSR request with admin response + optional file upload
    async submitDSRResponse(req, res) {
        try {
            const { id, request_status, admin_notes } = req.body;
            
            if (!id || !request_status || !admin_notes) {
                return res.status(400).json({ message: "Missing required fields." });
            }
            
            const updated_at = new Date();
            
            let file_paths = null;
            if (req.files && req.files.length > 0) {
                file_paths = req.files.map(file => file.path).join(',');
            }
            
            await dsrRequestModel.updateDSRRequestByAdmin({
                id,
                request_status,
                admin_notes,
                updated_at,
                file_paths,
            });
            
            res.status(200).json({ message: "DSR request updated successfully." });
        } catch (error) {
            console.error("Error updating DSR request:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
    

};

export default dsrRequestController;
