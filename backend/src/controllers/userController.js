import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import {config} from "../config/env.js";
import userModel from "../models/userModel.js";

const userController = {

    // Register Admin
    async registerUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role_id } = req.body;

        try {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user and assign role
            const userId = await userModel.createUser(username, email, hashedPassword);
            await userModel.assignRole(userId, role_id);

            res.status(201).json({ message: "User registered successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Login user
    async loginUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { email, password } = req.body;
    
        try {
            const user = await userModel.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
    
            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
    
            // Generate JWT token including user role
            const token = jwt.sign(
                { userId: user.id, role: user.role_name },
                config.JWT_SECRET,
                { expiresIn: "1h" }
            );

            // Log login event
            await userModel.logAccessEvent(user.id, "login");

    
            res.json({ message: "Login successful", token });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Create user (Only Admins can access)
    async createUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role_id } = req.body;

        try {
            // Check if the email already exists
            const existingUser = await userModel.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: "User with this email already exists" });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user and assign role
            const userId = await userModel.createUser(username, email, hashedPassword);
            await userModel.assignRole(userId, role_id);

            res.status(201).json({ message: "User created successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },


    // Logout user
    async logoutUser(req, res) {
        try {
            const userId = req.user.userId; 

            // Log logout event
            await userModel.logAccessEvent(userId, "logout");

            res.json({ message: "Logout successful" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },


    // Delete user (Only Admins can access)
    async deleteUser(req, res) {
        const userId = parseInt(req.params.userId, 10);
        
        try {
            // Check if user exists
            const user = await userModel.findUserById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
    
            // Delete the user
            await userModel.deleteUser(userId);
    
            res.json({ message: "User deleted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },


    // Get all users (Only Admins can access)
    async getAllUsers(req, res) {
        try {
            const users = await userModel.getAllUsers();
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }

     
};

export default userController;
