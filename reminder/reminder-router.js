require("dotenv").config();

const express = require("express");

const scheduler = require("node-schedule");
const sgMail = require("@sendgrid/mail");
// const sg = require("sendgrid")(process.env.SENDGRID_API_KEY);

const restrict = require("../util/tokenHelpers").restrict;
const Reminder = require("./reminder-model");
const Users = require("../user/user-model");

const router = express.Router();

router.get("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  try {
    const reminders = await Reminder.getAll(userId);
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error fetching the reminders from the database" });
  }
});

router.post("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  const reminder = req.body;
  if (
    !reminder.recipientName ||
    !reminder.recipientEmail ||
    !reminder.messageText ||
    !reminder.type ||
    !reminder.date
  ) {
    res.status(400).json({
      errorMessage:
        "Please provide all the required information: recipient name, recipient email, message, type, and the send date"
    });
  } else {
    try {
      reminder.sent = false;
      reminder.user_id = userId;
      const reminderId = await Reminder.add(reminder);
      const newReminder = await Reminder.getById(reminderId, userId);
      var templateId = "d-06792d3bd2124d2084a02a4d33f31e2f"; // default: type="other"
      const { recipientName, recipientEmail, messageText, date } = reminder;
      try {
        const user = await Users.findBy({ id: userId }).first();
        if (!user.name) user.name = "Anonymous";
        if (!user.email) user.email = "no-email";
        scheduler.scheduleJob(reminderId.toString(), date, async function() {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          if (reminder.type == "love") templateId = "d-077ee266376640e6bff9e1af15001ee1";
          else if (reminder.type == "birthday") templateId = "d-9dfaec48c5f5421cb45b29ebe82f42e8";
          else if (reminder.type == "getWell") templateId = "d-69ec184cdea841c8a34314f3698e7dc4";
          else if (reminder.type == "thank") templateId = "d-8f97a94affa44f6aac92c9ff4871bfde";
          const msg = {
            to: recipientEmail,
            from: "no-reply@no-reply.com",
            templateId: templateId,
            dynamic_template_data: {
              name: recipientName,
              email: user.email,
              sender: user.name,
              message: messageText
            }
          };
          console.log(msg);

          sgMail.send(msg);

          try {
            await Reminder.update(reminderId, userId, { sent: true });
          } catch (err) {
            console.log(err);
          }
        });
      } catch (err) {
        console.log("ERROR: ", err);
      }

      res.status(201).json(newReminder);
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error adding the reminder to the database" });
    }
  }
});

router.delete("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const count = await Reminder.remove(reminderId, userId);
    if (count === 0) {
      res.status(400).json({
        count: count,
        message: "Please provide a valid reminder id"
      });
    } else {
      // cancel the scheduler
      const scheduled = scheduler.scheduledJobs[reminderId.toString()];
      if (scheduled) {
        scheduled.cancel();
      }

      res.status(200).json({ count: count, message: "The reminder has been deleted" });
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error removing the reminder from the database" });
  }
});

router.put("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  const reminderInfo = req.body;
  var templateId = "d-06792d3bd2124d2084a02a4d33f31e2f"; // default: type="other"
  if (!reminderInfo || Object.keys(reminderInfo).length === 0) {
    res.status(400).json({
      errorMessage: "Please provide the information to be updated"
    });
  } else {
    try {
      const count = await Reminder.update(reminderId, userId, reminderInfo);
      if (count === 0) {
        res.status(400).json({
          count: count,
          message: "Please provide a valid reminder id and information"
        });
      } else {
        //update scheduler to send the email with the updated date
        if (reminderInfo.date) {
          // get the scheduler
          const scheduled = scheduler.scheduledJobs[reminderId.toString()];
          if (scheduled) {
            //cancel the previously scheduled email
            scheduled.cancel();
          }
          try {
            const user = await Users.findBy({ id: userId }).first();
            if (!user.name) user.name = "Anonymous";
            if (!user.email) user.email = "no-email";
            const reminder = await Reminder.getById(reminderId, userId);
            const { recipientEmail, recipientName, messageText, date } = reminder;
            scheduler.scheduleJob(reminderId.toString(), date, async function() {
              sgMail.setApiKey(process.env.SENDGRID_API_KEY);
              if (reminder.type == "love") templateId = "d-077ee266376640e6bff9e1af15001ee1";
              else if (reminder.type == "birthday") templateId = "d-9dfaec48c5f5421cb45b29ebe82f42e8";
              else if (reminder.type == "getWell") templateId = "d-69ec184cdea841c8a34314f3698e7dc4";
              else if (reminder.type == "thank") templateId = "d-8f97a94affa44f6aac92c9ff4871bfde";
              const msg = {
                to: recipientEmail,
                from: "no-reply@no-reply.com",
                templateId: templateId,
                dynamic_template_data: {
                  name: recipientName,
                  email: user.email,
                  sender: user.name,
                  message: messageText
                }
              };
              console.log(msg);

              sgMail.send(msg);

              await Reminder.update(reminderId, userId, { sent: true });
            });
          } catch (err) {
            console.log(err);
          }
        }
        res.status(200).json({ count: count, message: "The reminder has been updated" });
      }
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error updating the reminder in the database" });
    }
  }
});

router.get("/:id", restrict, async (req, res) => {
  const reminderId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const reminder = await Reminder.getById(reminderId, userId);
    if (!reminder) {
      res.status(400).json({
        message: "Please provide a valid reminder id."
      });
    } else {
      res.status(200).json(reminder);
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error fetching the reminder from the database" });
  }
});

module.exports = router;
