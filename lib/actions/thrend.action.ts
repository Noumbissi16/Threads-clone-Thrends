"use server";

import { revalidatePath } from "next/cache";
import Thrend from "../models/thrend.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId?: string;
  path: string;
}

export const createThrend = async ({
  text,
  author,
  communityId,
  path,
}: Params) => {
  try {
    connectToDB();

    const createdThrend = await Thrend.create({
      text,
      author,
      community: null,
    });

    //   update user model i.e update user who created the thrend
    await User.findByIdAndUpdate(author, {
      $push: { thrends: createdThrend._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thrend: ${error.message}`);
  }
};

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the number of documents to skip
    const skips = (pageNumber - 1) * pageSize;

    // Fetch post with no parents(top-level thrends... The rest are comments)
    const postsQuery = Thrend.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skips)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: { path: "author", model: User },
        select: "_id name parentId image",
      });

    const totalPostsCounts = await Thrend.countDocuments({
      parentId: { $in: [null, undefined] },
    });
    const posts = await postsQuery.exec();

    const isNext = totalPostsCounts > skips + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchThrendById(threndId: string) {
  try {
    connectToDB();
    const thrend = await Thrend.findById(threndId)
      .populate({ path: "author", model: User, select: "name _id id image" }) //TODO: populate community
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id name parentId image",
          },
          {
            path: "children",
            model: Thrend,
            populate: {
              path: "author",
              model: User,
              select: "_id name parentId image",
            },
          },
        ],
      });

    return thrend;
  } catch (error: any) {
    throw new Error(`Failed to fetch thrend: ${error.message}`);
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
  try {
    connectToDB();
    // Adding a comment to a thrend

    // 1. find oringal thrend by Id

    const originalThrend = await Thrend.findById(threndId);
    if (!originalThrend) {
      throw new Error("Thrend not found");
    }

    // 2. create new thrend with the comment text
    const commentThrend = new Thrend({
      text: commentText,
      author: userId,
      parentId: originalThrend._id,
    });

    // 3. save the new thrend
    const savedCommentThrend = await commentThrend.save();

    // 4. update and save original thrend to include the new comment
    originalThrend.children.push(savedCommentThrend._id);
    await originalThrend.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thrend: ${error.message}`);
  }
}
