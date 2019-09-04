## ForgetMeNot API
<p align="center">
  <img alt="forget Me Not homepage" src="https://github.com/leila100/forgetMeNot/blob/master/forgetmenot/src/assets/images/logo2.png">
</p>

ForgetMeNot is an application that sends thoughtful messages, on your behalf, to people you know on their special day.

This API covers all key use cases related to ForgetMeNot. The API uses [Express](https://expressjs.com/) which is a fast, unopinionated, minimalist web framework for Node.js

ForgetMeNot's API uses jsonwebtoken in conjunction with bcryptjs to check for a verified and active Token upon logging in for the front end.

## [Lambda Perpetual Access Fund](https://lambdapaf.org/)

Whether you use this project, have learned something from it, or just like it, please consider supporting it by donating to Lambda School's Perpetual Access Funds. This fund is used to provide student who have financial needs be able to continue their journey in [Lambda School](https://lambdaschool.com/)

Every dollar you donate to the Fund will be used to help someone create a new life for themselves. We hope you'll join us in helping students who need it most.

> note: click on the image below to donate:

[![button](https://github.com/labspt3-nutrition-tracker/nutrition-tracker-BE/blob/david-chua/Images/Lambda%20School.png)](https://lambdapaf.org/)

## Authors

* [Leila Berrouayel](https://github.com/leila100)

## Motivation?

- Enable users to keep track of important dates
- Provide users a reliable way to send friends/family messages on an important date
- Never forget an important date or disappoint a friend/family

## Technologies

Project is created with:
  * dotenv 7.0.0
  * express 4.16.4,
  * jsonwebtoken 8.5.1,
  * bcryptjs 2.4.3,
  * knex version: 0.16.5
  * pg version: 7.10.0
  * sqlite3 version: 4.0.6
  * newrelic 5.7.0,
  * node-schedule 1.3.2
  * nodemailer 6.1.1,
  * nodemailer-sendgrid-transport 0.2.0,
  * sendgrid 5.2.3

## Setup

To run this project, install it locally using yarn:

    $ Fork and clone this repository
    $ cd FMN_BE/
    $ yarn install
    $ Setup these environment vaiables:
    - JWT_SECRET: a secret used to create and verify the authentication token.
    - DB_ENV: set to production
    - In production - Have to add to Heroku these add-on: 
      - Sendgrid, 
      - New Relic APM (so Heroku doesn't go idle),
      - Postgres
    $ yarn start

Or use an already existing API to get started:

[ForgetMENot](https://fmn-be.herokuapp.com/)

## Covered Use Cases

  * Creating, Updating, Reading
    * users
  * Full CRUD functionality for
    * messages

 > Using the API for the front end requires a check using jsonwebtoken and bcryptjs. This would check against the user info and would result in an active token to be used in the headers

## API Endpoints

### Auth Endpoints

| Method | Endpoint      | Description                                                                                                                                                                                          |
| ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | /api/register | Creates a `user` sent inside the `body` of the request. **Hashes** password before saving to the database. Returns the id of the new user and a JWT token to be used to access restricted endpoints. |
| POST   | /api/login    | Uses the credentials sent inside the `body` to authenticate the user. On successful login, creates a JWT token to be used to access restricted endpoints.                                            |

### REMINDER Endpoints

| Method | Endpoint           | Description                                                                                                                                                                                 |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /api/reminders     | Retrieves a list of all the reminders created by the logged in user.                                                                                                                        |
| GET    | /api/reminders/:id | Retrieves a reminder specified by the `id` provided.                                                                                                                                        |
| POST   | /api/reminders     | If all required fields (recipient name, recipient email, message, category, send date) are met, creates a reminder. An email is scheduled to be sent on the sendDate (at 11:10 am central). |
| DELETE | /api/reminders/:id | Deletes the reminder with the specified `id`. It will also cancel the scheduled email.                                                                                                      |
| PUT    | /api/reminder/:id  | Updates the reminder with the specified `id`. If the sendDate has been changed, another email will be scheduled, and the previous one canceled.                                             |

## Data Models

### Reminder Data Model

| Field          | Type    | Description                                     |
| -------------- | ------- | ----------------------------------------------- |
| id             | Integer | ID of the newly created reminder.               |
| user_id        | Integer | User id of the user that created the reminder.  |
| recipientName  | String  | Name of the person the message will be sent to. |
| recipientEmail | String  | Email of the message recipient.                 |
| messageText    | String  | The text of the message.                        |
| type           | String  | The type that the reminder belongs to.          |
| date           | date    | The date the message is scheduled to be sent.   |
| sent           | boolean | flag to know if message was sent or not yet.    |
