"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "@/lib/models/user.model";
import Thrend from "@/lib/models/thrend.model";
import Community from "@/lib/models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level thrends) (a thrend that is not a comment/reply).
  const postsQuery = Thrend.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (thrends) i.e., thrends that are not comments.
  const totalPostsCount = await Thrend.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string;
  author: string;
  communityId?: string | null;
  path: string;
}

export async function createThrend({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdthrend = await Thrend.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { thrends: createdthrend._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { thrends: createdthrend._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thrend: ${error.message}`);
  }
}

async function fetchAllChildThrends(threndId: string): Promise<any[]> {
  const childthrends = await Thrend.find({ parentId: threndId });

  const descendantthrends = [];
  for (const childthrend of childthrends) {
    const descendants = await fetchAllChildThrends(childthrend._id);
    descendantthrends.push(childthrend, ...descendants);
  }

  return descendantthrends;
}

export async function deleteThrend(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thrend to be deleted (the main thrend)
    const mainthrend = await Thrend.findById(id).populate("author community");

    if (!mainthrend) {
      throw new Error("thrend not found");
    }

    // Fetch all child thrends and their descendants recursively
    const descendantthrends = await fetchAllChildThrends(id);

    // Get all descendant thrend IDs including the main thrend ID and child thrend IDs
    const descendantthrendIds = [
      id,
      ...descendantthrends.map((thrend) => thrend._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantthrends.map((thrend) => thrend.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainthrend.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantthrends.map((thrend) => thrend.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainthrend.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child thrends and their descendants
    await Thrend.deleteMany({ _id: { $in: descendantthrendIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { thrends: { $in: descendantthrendIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { thrends: { $in: descendantthrendIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thrend: ${error.message}`);
  }
}

export async function fetchThrendById(threndId: string) {
  connectToDB();

  try {
    const thrend = await Thrend.findById(threndId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thrend, // The model of the nested children (assuming it's the same "thrend" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thrend;
  } catch (err) {
    console.error("Error while fetching thrend:", err);
    throw new Error("Unable to fetch thrend");
  }
}

export async function addCommentToThrend({
  threndId,
  commentText,
  userId,
  path,
}: {
  threndId: string;
  commentText: string;
  userId: string;
  path: string;
}) {
  connectToDB();

  try {
    // Find the original thrend by its ID
    const originalthrend = await Thrend.findById(threndId);

    if (!originalthrend) {
      throw new Error("thrend not found");
    }

    // Create the new comment thrend
    const commentthrend = new Thrend({
      text: commentText,
      author: userId,
      parentId: threndId, // Set the parentId to the original thrend's ID
    });

    // Save the comment thrend to the database
    const savedCommentthrend = await commentthrend.save();

    // Add the comment thrend's ID to the original thrend's children array
    originalthrend.children.push(savedCommentthrend._id);

    // Save the updated original thrend to the database
    await originalthrend.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
