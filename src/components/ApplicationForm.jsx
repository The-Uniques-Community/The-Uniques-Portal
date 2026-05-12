import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from "@/config";

const ApplicationForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        college: '',
        course: '',
        graduationYear: '',
        linkedinProfile: '',
        whyJoin: '',
        heardFrom: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(
                `${BASE_URL}/api/campus-ambassador/apply`, 
                formData
            );
            
            console.log('Application submitted:', response.data);
            setSuccess(true);
            
            // Close the modal after showing success message for 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
            console.error('Error submitting form:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 p-6 rounded-lg text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h3 className="text-lg font-medium text-green-800">Application Submitted!</h3>
                <p className="mt-2 text-green-700">Thank you for applying to be a Campus Ambassador. We'll review your application and get back to you soon.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name*</label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email*</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">College/University*</label>
                    <input
                        type="text"
                        name="college"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.college}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Course/Degree*</label>
                    <input
                        type="text"
                        name="course"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.course}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Graduation Year*</label>
                    <input
                        type="text"
                        name="graduationYear"
                        required
                        placeholder="YYYY"
                        pattern="\d{4}"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                        value={formData.graduationYear}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn Profile (Optional)</label>
                <input
                    type="url"
                    name="linkedinProfile"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Why do you want to become a Campus Ambassador?*</label>
                <textarea
                    name="whyJoin"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                    rows="4"
                    minLength="50"
                    value={formData.whyJoin}
                    onChange={handleChange}
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">Please provide at least 50 characters</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">How did you hear about us?*</label>
                <select
                    name="heardFrom"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-red-500"
                    value={formData.heardFrom}
                    onChange={handleChange}
                >
                    <option value="">Select an option</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend">Friend or Classmate</option>
                    <option value="college">College/University</option>
                    <option value="event">Event</option>
                    <option value="search">Web Search</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    );
};

export default ApplicationForm;
