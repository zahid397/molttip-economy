const { getAllUsers } = require('../mock/users.store');
const { addPost } = require('../mock/posts.store');
const { addNotification } = require('../mock/notifications.store');
const logger = require('../config/logger');

const botPhrases = [
  'Just tipped someone! 🚀',
  'Web3 is the future 🌐',
  'Love this platform!',
  'Another day, another SURGE 💰',
  'Check out my latest creation!',
  'MoltTip rocks!',
  'Who else is here?',
  'To the moon! 🌕',
  'Decentralize everything!',
  'Supporting creators one tip at a time.',
];

const startAgentBot = () => {
  logger.info('Agent bot service started – posting every 2 minutes');
  setInterval(() => {
    try {
      const users = getAllUsers();
      const botUsers = users.filter(u => u.isBot);
      if (botUsers.length === 0) return;

      // Pick random bot
      const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
      const randomPhrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];

      // Create post
      const post = addPost({
        authorId: bot.id,
        content: randomPhrase,
        likes: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 5),
      });

      logger.info(`Bot ${bot.username} posted: "${randomPhrase}"`);

      // Randomly create notification for a random user (to simulate activity)
      if (Math.random() > 0.5) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (randomUser && !randomUser.isBot) {
          addNotification({
            userId: randomUser.id,
            type: 'system',
            message: `Bot ${bot.username} just posted: "${randomPhrase.substring(0, 30)}..."`,
            relatedId: post.id,
          });
        }
      }
    } catch (err) {
      logger.error('Agent bot error:', err);
    }
  }, 2 * 60 * 1000); // 2 minutes
};

module.exports = startAgentBot;
