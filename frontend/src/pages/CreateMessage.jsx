import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastOptions } from "../context/toastConfig";

const API_URL = import.meta.env.VITE_API_URL;

const CreateMessage = () => {
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const navigate = useNavigate();
  const handleCreateMessage = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      await axios.post(
        `${API_URL}/api/messages/create`,
        {
          content: message,
          delivery_time: scheduledTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Message created successfully!", toastOptions);
      navigate("/messages");
    } catch (err) {
      const errorMessage = err.response?.data?.msg;
      console.log("Error:", errorMessage);
      if (errorMessage === "Please enter all fields") {
        toast.error("Please enter all fields", toastOptions);
      } else if (errorMessage === "Delivery time cannot be in the past") {
        toast.error("Delivery time cannot be in the past", toastOptions);
      } else {
        toast.error("An error occurred", toastOptions);
      }
    }
  };
  return (
    <div>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer />
        <div className="bg-blue-600 text-white p-4 w-full mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Futurous</h1>
        </div>

        <div className="container mx-auto max-w-xl px-4 py-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Create Your Message
          </h2>

          <form
            onSubmit={handleCreateMessage}
            className="bg-white shadow-md rounded-lg p-8"
          >
            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                rows="4"
                placeholder="Write your message here..."
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="scheduled-time"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Scheduled Date and Time
              </label>
              <input
                type="datetime-local"
                id="scheduled-time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Create Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMessage;
