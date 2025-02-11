const { Post, Tag } = require("@src/associations/models/index");
const { HttpNotFoundError } = require("@src/utils/httpErrors");

// logged in user posts without tags
async function getAllPosts(userId) {
  return await Post.findAll({
    where: {
      userId,
    },
  });
}

// logged in user's posts WITH tags
async function getAllUserPostsWithTags(userId) {
  return await Post.findAll({
    where: {
      userId,
    },
    include: {
      // association: "tags",
      model: Tag,
      as: "tags",
    },
  });
}

// logged in user post without tags
async function getOnePostById(postId, userId) {
  const post = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
  });

  if (!post) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  return post;
}

/**
 ** 1.Creates/finds tags - ["memes", "politics", "etc"]
 ** 2. Creates a post
 ** 3. Associates it with found/created posts
 * @param {number} userId currently logged in user
 * @param {string[]} tagsArr array of strings, tags that will be created/fetched from DB
 * @returns {Post}
 */
async function createPostWithTags(userId, postData, tagsArr) {
  // TODO: I need to create Joi schema to convert tags: "politics, meme, etc" into array of these values
  // TODO: and probably find a way to combine a couple schemas objects to not create a separate schema
  let createdOrFetchedTags;

  try {
    // find or create new tags
    createdOrFetchedTags = await Promise.all(
      tagsArr.map(async (tagName) => {
        // because findOrCreate returns an array of 2 items - found or created instance AND boolean - true/false depends if it was created or found
        const tag = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: { name: tagName },
        });
        return tag[0];
      })
    );
  } catch (err) {
    console.log(err.message);
    throw new Error("Error during creating tags.");
  }

  const newPost = await Post.create({
    userId,
    title: postData.title,
    content: postData.content,
  });

  await newPost.setTags(createdOrFetchedTags);

  // do I fetch a newly created post with tags to show it was correctly created ?
  // const fetchNewPost = getOnePostWithAllTags(newPost.id, newPost.userId);
  // return fetchNewPost;

  return newPost;
}

// TODO: create update handler
async function updatePostById(postId, userId, postData) {
  const postToUpdate = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
  });

  if (!postToUpdate) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  postToUpdate.set({ postData });

  await postToUpdate.save();

  return postToUpdate;
}

// logged in user post WITH tags
async function getOnePostWithAllTags(postId, userId) {
  const postWithTags = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
    include: {
      // association: "tags",
      model: Tag,
      as: "tags",
    },
  });

  if (!postWithTags) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  return postWithTags;
}

// deletes 1 post for logged in user
async function deletePostById(postId, userId) {
  const postToDelete = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
  });

  if (!postToDelete) {
    throw new HttpNotFoundError(`Post with that id ${postId} is not found.`);
  }

  return null;
}

module.exports = {
  getAllPosts,
  getAllUserPostsWithTags,
  getOnePostById,
  createPostWithTags,
  updatePostById,
  getOnePostWithAllTags,
  deletePostById,
};
