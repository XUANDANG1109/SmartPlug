import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Clock.css";
import MQTT from '../../../services/MQTT';

function Clock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [turnOnTime, setTurnOnTime] = useState("");
  const [turnOffTime, setTurnOffTime] = useState("");
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState("OFF");
  const [isOnline, setIsOnline] = useState(true);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get("https://smart-plug-api-server.onrender.com/bookings", { timeout: 3000 });
        console.log("Server bookings:", response.data);
        setIsOnline(true);
        setBookings(prevBookings => {
          const serverBookings = response.data;
          const filteredServerBookings = serverBookings.filter(
            serverBooking => !pendingBookings.some(pending => pending.id === serverBooking.id)
          );
          return [...filteredServerBookings, ...pendingBookings];
        });
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkApiStatus();
    const statusCheck = setInterval(checkApiStatus, 30000);

    return () => clearInterval(statusCheck);
  }, [pendingBookings]);

  const formatDateTimeForMQTT = (dateTime, deviceStatus) => {
    const year = String(dateTime.getFullYear()).slice(-2);
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const status = deviceStatus === "ON" ? "1" : "0";
    return `${year}${month}${day}${hours}${minutes}${status}`;
  };

  const addSchedule = async () => {
    if (selectedDate && turnOnTime) {
      const startDateTime = new Date(`${selectedDate}T${turnOnTime}`);
      const endDateTime = turnOffTime ? new Date(`${selectedDate}T${turnOffTime}`) : null;

      if (isNaN(startDateTime.getTime()) || (endDateTime && isNaN(endDateTime.getTime()))) {
        alert("Invalid date or time. Please check your inputs.");
        return;
      }

      if (startDateTime < new Date() || (endDateTime && endDateTime < new Date())) {
        alert("Cannot schedule in the past. Please choose a future time.");
        return;
      }

      const isDuplicate = bookings.some(booking => {
        const existingStart = new Date(booking.booking_time);
        const existingEnd = new Date(booking.end_time);
        return (startDateTime >= existingStart && startDateTime < existingEnd) ||
          (endDateTime && endDateTime > existingStart && endDateTime <= existingEnd);
      });

      if (isDuplicate) {
        alert("This time slot is already booked. Please choose another time.");
        return;
      }

      const formatDateWithOffset = (date, timeZone) => {
        const formatter = new Intl.DateTimeFormat("sv-SE", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
        const parts = formatter.formatToParts(date);
        const dateTimeParts = parts.reduce((acc, part) => {
          acc[part.type] = part.value;
          return acc;
        }, {});
        const offset = date.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" })
          .match(/GMT([+-]\d{2}:\d{2})/)[1];
        return `${dateTimeParts.year}-${dateTimeParts.month}-${dateTimeParts.day}T${dateTimeParts.hour}:${dateTimeParts.minute}`;
      };

      const newBooking = {
        id: Date.now(),
        booking_time: formatDateWithOffset(startDateTime, "Europe/Helsinki"),
        device_state: deviceStatus,
      };

      setPendingBookings(prevPending => [...prevPending, newBooking]);
      setBookings(prevBookings => [...prevBookings, newBooking]);

      const mqttData = formatDateTimeForMQTT(startDateTime, deviceStatus);
      await MQTT.publish("timer", mqttData);

      const bookingConfirmationHandler = (message) => {
        if (message === "smart_plug/timer_ok") {
          setBookingError("");
          alert("Booking set successfully!");
          setPendingBookings(prevPending => prevPending.filter(pending => pending.id !== newBooking.id));
        } else {
          setBookingError("Failed to connect. Please try again.");
          setBookings(prevBookings => prevBookings.filter(booking => booking.id !== newBooking.id));
          setPendingBookings(prevPending => prevPending.filter(pending => pending.id !== newBooking.id));
        }
      };

      MQTT.client.subscribe("smart_plug/timer_ok", bookingConfirmationHandler);

      if (isOnline) {
        try {
          const bookingData = {
            charger_id: 3,
            booking_time: formatDateWithOffset(startDateTime, "Europe/Helsinki"),
            device_state: deviceStatus,
          };
          console.log("booking data:", bookingData);

          await axios.post(
            "https://smart-plug-api-server.onrender.com/bookings",
            bookingData)
            .then(response => {
              console.log('Booking created:', response.data);
              window.location.reload();
            })

        } catch (apiError) {
          setIsOnline(false);
          console.warn('Failed to sync with server - working in offline mode');
          setBookings(prevBookings => prevBookings.filter(booking => booking.id !== newBooking.id));
          setPendingBookings(prevPending => prevPending.filter(pending => pending.id !== newBooking.id));

        }
      }
    } else {
      alert("Please fill in all fields");
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axios.delete(`https://smart-plug-api-server.onrender.com/bookings/${id}`);
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleDelete = (id, time, state) => {
    // state = booking.device_state;
    const mqttData = formatDateTimeForMQTT(new Date(time), state);
    MQTT.publish("timer_remove", mqttData);

    // MQTT.client.subscribe("smart_plug/timer_remove_ok", deleteConfirmationHandler);
    MQTT.onMessage('smart_plug/timer_remove_ok', (message) => {
      // Update button state based on received message
      console.log(message);
      console.log('id: %d', id);
      deleteBooking(id);
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "Invalid Time";
    return date.toLocaleTimeString("en-US", {
      timeZone: "Europe/Helsinki",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="alarm-clock bg-white dark:bg-gray-800 p-6 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Set Schedule
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Schedule timers to turn device's socket ON or OFF
      </p>

      {!isOnline && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Working in offline mode - cannot set schedule
        </div>
      )}

      {bookingError && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {bookingError}
        </div>
      )}

      <div className="current-time text-gray-800 dark:text-white">
        {currentTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",

        })}
      </div>

      <div className="schedule-form bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="date-picker mb-4">
          <label className="text-gray-700 dark:text-gray-300">Date:</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                             bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            placeholder="MM/DD/YY"
          />
        </div>
        <div className="flex-1">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Time:</label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                            bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={turnOnTime}
                  onChange={(e) => setTurnOnTime(e.target.value)}
                  required
                />
                <span className="clock-icon" role="img" aria-label="clock">🕒</span>
              </div>
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-300 block mb-2">Action:</label>
              <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${deviceStatus === "ON"
                    ? "bg-green-500 text-white"
                    : "text-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => setDeviceStatus("ON")}
                >
                  ON
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${deviceStatus === "OFF"
                    ? "bg-red-500 text-white"
                    : "text-gray-700 dark:text-gray-300"
                    }`}
                  onClick={() => setDeviceStatus("OFF")}
                >
                  OFF
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          className="w-full mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 
                                 text-white rounded-md transition duration-200
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={addSchedule}
        >
          Set Booking
        </button>
      </div>
      <div className="schedule-list mt-8">
        <h2 className="text-xl font-semibold text-white dark:text-white mb-4">
          Your Bookings
        </h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
        ) : (
          <div className="grid gap-4">
            {bookings
              .sort((a, b) => new Date(a.booking_time) - new Date(b.booking_time))
              .map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-700 p-4 rounded-lg shadow"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-lg">
                      <span role="img" aria-label="calendar">📅</span>{" "}
                      {new Date(booking.booking_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-lg">
                      <span role="img" aria-label="time">🕒</span>{" "}
                      {formatTime(booking.booking_time)}
                      <span className={`ml-2 ${booking.device_state == true ? "text-green-500" : "text-red-500"}`}>
                        {booking.device_state == true ? (
                          <span role="img" aria-label="status on">🟢</span>
                        ) : (
                          <span role="img" aria-label="status off">🔴</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(booking.id, booking.booking_time, booking.device_state)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="delete booking"
                  >
                    <span role="img" aria-label="delete">❌</span>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Clock;