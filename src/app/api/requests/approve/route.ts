import Request from "@/models/Request";
import Ride from "@/models/Ride";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Id is required" }, { status: 400 });
  }

  const session = await mongoose.startSession();
  try {
    let resultRequest: any = null;

    await session.withTransaction(async () => {
      const request = await Request.findById(id).session(session);
      if (!request) {
        throw { status: 404, message: "Request not found" };
      }
      if (request.approved) {
        resultRequest = request;
        return;
      }

      const ride = await Ride.findById(request.ride).session(session);
      if (!ride) {
        throw { status: 404, message: "Ride not found" };
      }

      // Use defined model fields: car.capacity and passengers.length
      const capacity = ride.car?.capacity ?? 0;
      const currentPassengers = Array.isArray(ride.passengers)
        ? ride.passengers.length
        : 0;
      const seatsRemaining = capacity - currentPassengers;

      if (seatsRemaining <= 0) {
        throw { status: 400, message: "No seats available" };
      }

      // Approve request and add passenger atomically
      request.approved = true;
      await request.save({ session });

      ride.passengers.push(request.user);
      if (ride.passengers.length >= capacity) ride.isFull = true;
      await ride.save({ session });

      resultRequest = request;
    });

    session.endSession();
    return NextResponse.json(resultRequest);
  } catch (err: any) {
    session.endSession();
    console.error(err);
    const status = err?.status ?? 500;
    const message = err?.message ?? "Failed to approve the request";
    return NextResponse.json({ message }, { status });
  }
}
