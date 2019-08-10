require("dotenv").config();

const express = require("express");

const scheduler = require("node-schedule");
const sg = require("sendgrid")(process.env.SENDGRID_API_KEY);

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

      const { recipientName, recipientEmail, messageText, date } = reminder;
      try {
        const user = await Users.findBy({ id: userId }).first();
        if (!user.name) user.name = "Anonymous";
        if (!user.email) user.email = "no-email";
        scheduler.scheduleJob(reminderId.toString(), date, async function() {
          const request = sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: {
              personalizations: [
                {
                  to: [
                    {
                      email: recipientEmail
                    }
                  ],
                  subject: "You have a message from someone who cares!"
                }
              ],
              from: {
                email: "no-reply@no-reply.com"
              },
              content: [
                {
                  type: "text/html",
                  value: `
                    <div>
                      <h1 style="color:#4c688f;font-size:30px;">Hello ${recipientName}</h1>
                      <h3>from ${user.name} - ${user.email}</h3>
                      <p>${messageText}</p>
                      <p>Sent from <span style="color:#284243;font-size:30px;">ForgetMeNot</span></p>
                    </div>
                    `
                }
              ]
            }
          });
          sg.API(request)
            .then(response => {
              console.log(response.statusCode);
              console.log(response.body);
              console.log(response.headers);
            })
            .catch(error => {
              console.log(error.response.statusCode);
            });

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
              const request = sg.emptyRequest({
                method: "POST",
                path: "/v3/mail/send",
                body: {
                  personalizations: [
                    {
                      to: [
                        {
                          email: recipientEmail
                        }
                      ],
                      subject: "You have a message from someone who cares!"
                    }
                  ],
                  from: {
                    email: "no-reply@no-reply.com"
                  },
                  content: [
                    {
                      type: "text/html",
                      value: `
                        <div>
                          <h1 style="color:#4c688f;font-size:30px;">Hello ${recipientName}</h1>
                          <h3>from ${user.name} - ${user.email}</h3>
                          <p>${messageText}</p>
                          <p>Sent from <span style="color:#284243;font-size:30px;">ForgetMeNot</span></p>
                        </div>
                      `
                    }
                  ]
                }
              });
              sg.API(request)
                .then(response => {
                  console.log(response.statusCode);
                  console.log(response.body);
                  console.log(response.headers);
                })
                .catch(error => {
                  console.log(error.response.statusCode);
                });

              try {
                await Reminder.update(reminderId, userId, { sent: true });
              } catch (err) {
                console.log(err);
              }
            });
          } catch (err) {
            console.log("ERROR: ", err);
          }
        }
        res.status(200).json({ count: count, message: "The reminder has been updated" });
      }
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error removing the reminder from the database" });
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
