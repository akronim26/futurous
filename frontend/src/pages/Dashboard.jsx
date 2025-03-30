import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastOptions } from "../context/toastConfig";

const Dashboard = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logout successful!", toastOptions);
    navigate("/");
  };

  const handleDeleteMessage = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      await axios.delete(`http://localhost:3000/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(messages.filter((message) => message.id !== id));
      toast.success("Message deleted successfully!", toastOptions);
    } catch (err) {
      const errorMessage = err.response?.data?.msg;
      if (errorMessage === "Message not found") {
        toast.error("Message not found", toastOptions);
      } else if (errorMessage === "Message already locked") {
        toast.error("Message already locked", toastOptions);
      } else if (errorMessage === "Message already delivered") {
        toast.error("Message already delivered", toastOptions);
      } else {
        toast.error("An error occurred", toastOptions);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
      const response = await fetch("http://localhost:3000/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      const errorMessage = err.response?.data?.msg;
      if (errorMessage === "No messages found") {
        toast.error("No messages found", toastOptions);
      } else {
        toast.error("An error occurred", toastOptions);
      }
    }
  };

  const truncateMessage = (message) => {
    if (message.length > 30) {
      return message.substring(0, 30) + "...";
    }
    return message;
  };

  const handleCreateMessage = () => {
    try {
      navigate("/messages/create");
    } catch (err) {
      console.log(err);
    }
  };

  const calculateCountdown = (deliveryTime) => {
    const now = new Date();
    const delivery_time = new Date(deliveryTime);
    const timeLeft = delivery_time - now;

    if (timeLeft <= 0) {
      return "Delivered";
    }
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
  };

  const calculateLockCountdown = (createdAt, deliveryTime) => {
    const creationTime = new Date(createdAt);
    const deliveryTimeDate = new Date(deliveryTime);
    const timeDiff = deliveryTimeDate - creationTime;

    if (isNaN(creationTime) || isNaN(deliveryTimeDate)) {
      return "Invalid time";
    }

    const timeElapsed = new Date() - creationTime;

    if (calculateCountdown(deliveryTime) === "Delivered") {
      return "Delivered";
    }

    if (timeElapsed > timeDiff * 0.1) {
      return "Locked";
    }

    const lockTimeLeft = timeDiff * 0.1 - timeElapsed;
    const days = Math.floor(lockTimeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((lockTimeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((lockTimeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((lockTimeLeft / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s left to lock`;
  };

  useEffect(() => {
    fetchMessages();

    const runCountdown = setInterval(() => {
      setMessages((prevMessages) =>
        prevMessages.map((message) => ({
          ...message,
          countdown: calculateCountdown(message.delivery_time),
          lockCountdown: calculateLockCountdown(
            message.created_at,
            message.delivery_time
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(runCountdown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <ToastContainer />
      <div className="bg-blue-600 text-white p-4 flex fixed w-full justify-between items-center">
        <h1 className="text-2xl font-bold">Futurous</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>

      <div className="container mt-16 mx-auto p-6 grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-md justify-between items-center flex p-6">
          <h2 className="text-xl font-semibold mb-4">Create Message</h2>
          <button
            onClick={handleCreateMessage}
            className=" bg-blue-500 px-6 py-2 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create New Message
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">View Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    "bg-gray-100 p-4 rounded-lg flex justify-between items-center"
                  }
                >
                  <div>
                    <p
                      className={`font-medium ${
                        message.lockCountdown === "Locked" &&
                        message.countdown !== "delivered"
                          ? "blur-sm"
                          : ""
                      }`}
                    >
                      {truncateMessage(message.content)}
                    </p>
                    <p className="text-sm text-gray-500">{message.timestamp}</p>
                    <p className="text-sm text-gray-500">
                      Countdown:{" "}
                      {message.countdown ||
                        calculateCountdown(message.delivery_time)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Lock Countdown:{" "}
                      {message.lockCountdown || "Calculating..."}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        if (
                          message.lockCountdown === "Locked" ||
                          message.countdown === "Delivered"
                        ) {
                          toast.error(
                            message.lockCountdown === "Locked"
                              ? "This message is locked and cannot be deleted."
                              : "This message is already delivered and cannot be deleted.",
                            toastOptions
                          );
                          return;
                        }
                        handleDeleteMessage(message.id);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                      disabled={
                        message.lockCountdown === "Locked" ||
                        message.countdown === "Delivered"
                      }
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        if (
                          message.lockCountdown === "Locked" ||
                          message.countdown === "Delivered"
                        ) {
                          toast.error(
                            message.lockCountdown === "Locked"
                              ? "This message is locked and cannot be updated."
                              : "This message is already delivered and cannot be updated.",
                            toastOptions
                          );
                          return;
                        }
                        navigate(`/messages/${message.id}`);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                      disabled={
                        message.lockCountdown === "Locked" ||
                        message.countdown === "Delivered"
                      }
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
