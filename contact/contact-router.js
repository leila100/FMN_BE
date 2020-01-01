const express = require("express");

const restrict = require("../util/tokenHelpers").restrict;
const Contact = require("./contact-model");

const router = express.Router();

router.get("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  try {
    const contacts = await Contact.getAll(userId);
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error getting the contacts from the database" });
  }
});

router.post("/", restrict, async (req, res) => {
  const userId = req.userInfo.subject;
  const contact = req.body;
  if (!contact.contactName || !contact.contactEmail) {
    res.status(400).json({
      errorMessage: "Please provide all the required information: contact name, contact email"
    });
  } else {
    try {
      contact.user_id = userId;
      const contactId = await Contact.add(contact);
      const newContact = await Contact.getById(contactId, userId);
      res.status(201).json(newContact);
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error adding the contact to the database" });
    }
  }
});

router.delete("/:id", restrict, async (req, res) => {
  const contactId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const count = await Contact.remove(contactId, userId);
    if (count === 0) {
      res.status(400).json({
        count: count,
        message: "Please provide a valid contact id"
      });
    } else {
      res.status(200).json({ count: count, message: "The contact has been deleted" });
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error removing the contact from the database" });
  }
});

router.put("/:id", restrict, async (req, res) => {
  const contactId = req.params.id;
  const userId = req.userInfo.subject;
  const contactInfo = req.body;
  if (!contactInfo || Object.keys(contactInfo).length === 0) {
    res.status(400).json({
      errorMessage: "Please provide the information to be updated"
    });
  } else {
    try {
      const count = await Contact.update(contactId, userId, contactInfo);
      if (count === 0) {
        res.status(400).json({
          count: count,
          message: "Please provide a valid contact id and information"
        });
      } else {
        res.status(200).json({ count: count, message: "The contact has been updated" });
      }
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error updating the contact in the database" });
    }
  }
});

router.get("/:id", restrict, async (req, res) => {
  const contactId = req.params.id;
  const userId = req.userInfo.subject;
  try {
    const contact = await Contact.getById(contactId, userId);
    if (!contact) {
      res.status(400).json({
        message: "Please provide a valid contact id."
      });
    } else {
      res.status(200).json(contact);
    }
  } catch (err) {
    res.status(500).json({ errorMessage: "There was an error fetching the contact from the database" });
  }
});

module.exports = router;
