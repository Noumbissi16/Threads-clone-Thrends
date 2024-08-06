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
