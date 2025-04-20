import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const UpdateMessage = () => {
  const [message, setMessage] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const handleUpdateMessage = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      await axios.put(
        `${API_URL}/api/messages/${id}`,
        {
          content: message,
          delivery_time: scheduledTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/messages");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Futurous</h1>
      </div>

      <div className="container mx-auto max-w-xl px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Update Your Message
        </h2>

        <form
          onSubmit={handleUpdateMessage}
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
              placeholder="Edit your message here..."
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
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Update Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateMessage;
