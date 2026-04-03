import consentUserapiModel from "../models/consentUserapiModel.js";

const consentUserController = {


    //______________Api's for User Details______________

    // ✅ Get all user details
    async getAllUsers(req, res) {
        try {
            const users = await consentUserapiModel.getAllUsers();
            res.status(200).json({ success: true, users });
        } catch (error) {
            console.error("Error fetching all users:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },

    // ✅ Get user by email
    async getUserByEmail(req, res) {
        const { email } = req.params;

        try {
            const user = await consentUserapiModel.getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, user });
        } catch (err) {
            console.error("Error fetching user by email:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ Get user by phone
    async getUserByPhone(req, res) {
        const { phone } = req.params;

        try {
            const user = await consentUserapiModel.getUserByPhone(phone);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, user });
        } catch (err) {
            console.error("Error fetching user by phone:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ Get user by ID
    async getUserById(req, res) {
        const { id } = req.params;

        try {
            const user = await consentUserapiModel.getUserById(Number(id));
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, user });
        } catch (err) {
            console.error("Error fetching user by ID:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ Get user by username
    async getUserByUsername(req, res) {
        const { username } = req.params;

        try {
            const user = await consentUserapiModel.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, user });
        } catch (err) {
            console.error("Error fetching user by username:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },


//______________Api's for Consent Info______________

// Get consent details by user email
async getConsentByEmail(req, res) {
    const { email } = req.params; // fetch email from URL parameters

    if (!email) {
        return res.status(400).json({ error: "Email parameter is required" });
    }

    try {
        const data = await consentUserapiModel.getUserConsentDetailsByEmail(email);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No consent data found for this email" });
        }

        res.json({ email, consents: data });
    } catch (err) {
        console.error("Error in getConsentByEmail:", err);
        res.status(500).json({ error: "Server error" });
    }
},


// Get consent details by user phone number
async getConsentByPhone(req, res) {
    const { phone } = req.params; // fetch phone number from URL parameters

    if (!phone) {
        return res.status(400).json({ error: "Phone number parameter is required" });
    }

    try {
        const data = await consentUserapiModel.getUserConsentDetailsByPhone(phone);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No consent data found for this phone number" });
        }

        res.json({ phone, consents: data });
    } catch (err) {
        console.error("Error in getConsentByPhone:", err);
        res.status(500).json({ error: "Server error" });
    }
},


// Get consent details by user ID
async getConsentById(req, res) {
    const { id } = req.params; // fetch user ID from URL parameters

    if (!id) {
        return res.status(400).json({ error: "User ID parameter is required" });
    }

    try {
        const data = await consentUserapiModel.getUserConsentDetailsById(id);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No consent data found for this user ID" });
        }

        res.json({ id, consents: data });
    } catch (err) {
        console.error("Error in getConsentById:", err);
        res.status(500).json({ error: "Server error" });
    }
},


// Get consent details by username
async getConsentByUsername(req, res) {
    const { username } = req.params; // fetch username from URL parameters

    if (!username) {
        return res.status(400).json({ error: "Username parameter is required" });
    }

    try {
        const data = await consentUserapiModel.getUserConsentDetailsByUsername(username);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No consent data found for this username" });
        }

        res.json({ username, consents: data });
    } catch (err) {
        console.error("Error in getConsentByUsername:", err);
        res.status(500).json({ error: "Server error" });
    }
},



    

    // ✅ Get users who gave consent
    async getUsersWhoGaveConsent(req, res) {
        try {
            const users = await consentUserapiModel.getUsersWithConsent();
            res.status(200).json({ success: true, users });
        } catch (err) {
            console.error("Error fetching users with consent:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // ✅ Get users who did not give consent
    async getUsersWhoDidNotGiveConsent(req, res) {
        try {
            const users = await consentUserapiModel.getUsersWithoutConsent();
            res.status(200).json({ success: true, users });
        } catch (err) {
            console.error("Error fetching users without consent:", err);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },


};

export default consentUserController;
