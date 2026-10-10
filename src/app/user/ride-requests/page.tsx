"use client";

import { Booking } from "@/types/Booking";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const RideRequestsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const fetchBookings = async () => {
    const res = await axios.get("/api/requests/getRequests");
    setBookings(res.data);
  };
  useEffect(() => {
    fetchBookings();
  }, []);
  const handleApprove = (id: string) => async () => {
    const res = axios.put(`/api/requests/approve?id=${id}`);
    toast.promise(res, {
      loading: "Approving the request...",
      success: "Request approved successfully",
      error: "Failed to approve the request",
    });
  };
  return (
    <>
      <h1 className="text-4xl font-bold mb-6 text-center uppercase">
        Ride Requests
      </h1>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-300">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>#</th>
              <th>Ride</th>
              <th>Passenger</th>
              <th>Status</th>
              {/* <th>View Passenger</th> */}
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length !== 0 ? (
              bookings.map((booking, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{booking.ride.title}</td>
                  <td>{booking.user.name}</td>
                  <td>
                    {booking.approved ? (
                      <span className="text-green-500">Approved</span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleApprove(booking._id)}
                      >
                        Appove
                        {/* <button className="btn btn-danger">Reject</button> */}
                      </button>
                    )}
                  </td>
                  {/* <td>
                    <Link
                      href={`/user/profile?id=${booking.user._id}`}
                      className="btn btn-primary"
                    >
                      View Passenger
                    </Link>
                  </td> */}
                  <td>
                    {booking.payment ? (
                      <span className="text-green-500">Paid</span>
                    ) : (
                      <span className="text-red-500">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center">
                  No Bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default RideRequestsPage;
