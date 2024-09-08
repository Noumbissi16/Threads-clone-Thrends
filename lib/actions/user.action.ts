"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thrend from "../models/thrend.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";

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
    const user = await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
    return user;
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
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thrend,
          populate: {
            path: "author",
            model: User,
            select: "name id image",
          },
        },
      ],
    });

    return thrends;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
      ];
    }

    const sortOptions = {
      createdAt: sortBy,
    };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);
    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // find all the thrends created by the user
    const userThreads = await Thrend.find({ author: userId });
    // Collect all the child thread ids(replies) from children fiels

    const childThrendIds = userThreads.reduce((acc, userThrend) => {
      return acc.concat(userThrend.children);
    }, []);

    // find all replies except those made by same user
    const replies = await Thrend.find({
      _id: { $in: childThrendIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Error fetching user's activities ${error.message}`);
  }
}
