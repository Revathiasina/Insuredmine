const cron = require('node-cron');
const Messages = require('../models/messages');

const scheduleJob = async (req, res) => {
  const { message, day, time } = req.body;
  // {
  //     "message": "happy birthday",
  //     "day": "2",
  //     "time": "0 10"
  // }

  // Validate day and time
  if (!cron.validate(`${time} * * ${day}`)) {
    return res.status(400).send('Invalid day or time');
  }

  // Schedule the task
  cron.schedule(`${time} * * ${day}`, async () => {
    const newMessage = await Messages.create({ content: message, day, time });
    newMessage.save();
  });

  res.send('Message scheduled');
};

module.exports = {
  scheduleJob
};