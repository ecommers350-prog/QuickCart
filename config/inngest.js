"use server";

import { Inngest } from "inngest";
import User from "@/models/User";
import connectDB from "./db";

// Create Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

/* ---------------- CREATE USER ---------------- */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await connectDB();

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(" "),
      imageUrl: image_url || "",
    };

    // Prevent duplicate insert on retries
    await User.findByIdAndUpdate(id, userData, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    return { success: true };
  }
);

/* ---------------- UPDATE USER ---------------- */
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await connectDB();

    const userData = {
      email: email_addresses?.[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(" "),
      imageUrl: image_url || "",
    };

    await User.findByIdAndUpdate(id, userData, { new: true });

    return { success: true };
  }
);

/* ---------------- DELETE USER ---------------- */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await User.findByIdAndDelete(id);

    return { success: true };
  }
);
