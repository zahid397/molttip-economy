const logger = require('../config/logger');
const sleep = require('../utils/sleep');

const { users } = require('../mock/users.store');
const { addPost } = require('../mock/posts.store');
const { addComment } = require('../mock/comments.store');
const { addTip } = require('../mock/tips.store');
const { updateUserEarnings } = require('../mock/users.store');
const { addNotification } = require('../mock/notifications.store');

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const samplePosts = [
  "Just tipped 10 MOLT to a great creator 🚀",
  "Web3 tipping ecosystem is growing fast 🔥",
  "Building MoltTip every day 😎",
  "GM ☕ Ready to ship features!",
  "AI + Web3 is the future 🤖💎",
];

const sampleComments = [
  "Awesome work! 🔥",
  "Love this community 💜",
  "Let’s build together 🚀",
  "This is huge!",
  "Keep going!",
];

const startAgentBot = async () => {
  logger.info("🤖 Agent Bot Service Started...");

  while (true) {
    try {
      await sleep(30000); // every 30 seconds

      const botUsers = users.filter(u => u.isBot);
      if (botUsers.length === 0) continue;

      const bot = randomFrom(botUsers);

      const actionType = Math.floor(Math.random() * 3);

      // ----------------------------
      // 1️⃣ Create Post
      // ----------------------------
      if (actionType === 0) {
        const content = randomFrom(samplePosts);

        const post = addPost({
          authorId: bot.id,
          content,
          likes: Math.floor(Math.random() * 100),
          comments: 0,
        });

        logger.info(`🤖 Bot ${bot.username} created post: ${content}`);
      }

      // ----------------------------
      // 2️⃣ Comment on Post
      // ----------------------------
      if (actionType === 1) {
        const { posts } = require('../mock/posts.store');
        if (posts.length === 0) return;

        const post = randomFrom(posts);
        const commentText = randomFrom(sampleComments);

        addComment({
          postId: post.id,
          authorId: bot.id,
          content: commentText,
        });

        post.comments += 1;

        logger.info(`🤖 Bot ${bot.username} commented on post`);
      }

      // ----------------------------
      // 3️⃣ Tip Random User
      // ----------------------------
      if (actionType === 2) {
        const realUsers = users.filter(u => !u.isBot);
        if (realUsers.length === 0) return;

        const recipient = randomFrom(realUsers);
        const amount = parseFloat((Math.random() * 5 + 1).toFixed(2));

        const tip = addTip({
          fromUserId: bot.id,
          toUserId: recipient.id,
          amount,
        });

        updateUserEarnings(recipient.id, amount);

        addNotification({
          userId: recipient.id,
          type: "tip",
          message: `You received ${amount} MOLT from ${bot.username}`,
          relatedId: tip.id,
        });

        logger.info(`🤖 Bot ${bot.username} tipped ${amount} to ${recipient.username || recipient.address}`);
      }

    } catch (err) {
      logger.error("Agent Bot Error:", err.message);
    }
  }
};

module.exports = startAgentBot;
