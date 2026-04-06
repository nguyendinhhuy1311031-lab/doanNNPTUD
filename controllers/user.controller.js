/**
 * @file user.controller.js
 * @description This file contains the controller functions for managing user accounts.
 * It includes functionality for retrieving user details, updating user information, and changing user passwords.
 * The controller handles interactions with the database to fetch, update, and manage user data securely.
 * Password changes are handled with encryption to ensure security. Sensitive user information is protected and excluded from responses.
 */

var db = require('../models');
var bcrypt = require('bcrypt');

module.exports = {
    /**
     * @function getUser
     * @description Retrieves the details of the currently authenticated user.
     * The user ID is extracted from the request object, which is set by the verifyToken middleware.
     * Sensitive information like the password is excluded from the response.
     * @param {Object} req - The request object (contains user ID from verifyToken middleware).
     * @param {Object} res - The response object.
     * @returns {void}
     */
    getUser: async function (req, res) {
        try {
            var userId = req.user.id; // Get user ID from the request object (assumed to be set by verifyToken middleware)
            var user = await db.user.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Exclude sensitive information
            var userData = user.toJSON();
            delete userData.password;

            res.status(200).json(userData);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    /**
     * @function updateUser
     * @description Updates the details of the currently authenticated user.
     * The user ID is extracted from the request object, which is set by the verifyToken middleware.
     * User details such as username, email, name, and phone number can be updated. 
     * If the email is updated, the email verification status is reset.
     * Sensitive information like the password is excluded from the response.
     * @param {Object} req - The request object (contains user details to be updated).
     * @param {Object} res - The response object.
     * @returns {void}
     */
    updateUser: async function (req, res) {
        try {
            var userId = req.user.id; // Get user ID from the request object (assumed to be set by verifyToken middleware)
            var username = req.body.username;
            var email = req.body.email;
            var name = req.body.name;
            var phoneNumber = req.body.phoneNumber;

            // Find the user
            var user = await db.user.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update user details
            user.username = username || user.username;
            user.email = email || user.email;
            user.name = name || user.name;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            if (email) {
                user.emailVerified = false;
            }

            await user.save();

            // Exclude sensitive information
            var userData = user.toJSON();
            delete userData.password;
            res.status(200).json(userData);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    },

    /**
     * @function changePassword
     * @description Changes the password for the currently authenticated user.
     * The user ID is extracted from the request object, which is set by the verifyToken middleware.
     * The current password is verified before updating to the new password, which is hashed for security.
     * @param {Object} req - The request object (contains current and new passwords).
     * @param {Object} res - The response object.
     * @returns {void}
     */
    changePassword: async function (req, res) {
        try {
            var userId = req.user.id; // Get user ID from the request object (assumed to be set by verifyToken middleware)
            var currentPassword = req.body.currentPassword;
            var newPassword = req.body.newPassword;

            // Find the user
            var user = await db.user.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if current password is correct
            var isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash the new password
            var hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;

            // Save the new password
            await user.save();

            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};

