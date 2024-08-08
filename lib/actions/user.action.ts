"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thrend from "../models/thrend.model";

interface Params {
  username: string;
  userId: string;
  bio: string;
  image: string;
  name: string;
  path: string;
}
export async function updateUser({
  username,
  userId,
  bio,
  image,
  name,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    const user = await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLocaleLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true, new: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export const fetUser = async (userId: string) => {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    //    .populate({
    //      path: "communities",
    //      model: Community
    //  })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    // find all thrends authored by the user with Id userId
    const thrends = await User.findOne({ id: userId }).populate({
      path: "thrends",
      model: Thrend,
      populate: {
        path: "children",
        model: Thrend,
        populate: { path: "author", model: User, select: "name id image" },
      },
    });
    // TODO: populate community

    return thrends;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}
