## Forget Me not API
This API covers all key use cases related to Forget Me Not. The API uses [Express](https://expressjs.com/) which is a fast, unopinionated, minimalist web framework for Node.js

Forget Me not's API uses jsonwebtoken in conjunction with bcryptjs to check for a verified and active Token upon logging in for the front end.

## [Lambda Perpetual Access Fund](https://lambdapaf.org/)

Whether you use this project, have learned something from it, or just like it, please consider supporting it by donating to Lambda School's Perpetual Access Funds. This fund is used to provide student who have financial needs be able to continue their journey in [Lambda School](https://lambdaschool.com/)

Every dollar you donate to the Fund will be used to help someone create a new life for themselves. We hope you'll join us in helping students who need it most.

> note: click on the image below to donate:

[![button](https://github.com/labspt3-nutrition-tracker/nutrition-tracker-BE/blob/david-chua/Images/Lambda%20School.png)](https://lambdapaf.org/)

## Authors

* [Leila Berrouayel](https://github.com/leila100)

## Covered Use Cases

  * Creating, Updating, Reading
    * users
  * Full CRUD functionality for
    * messages

 > Using the API for the front end requires a check using jsonwebtoken and bcryptjs. This would check against the user info and would result in an active token to be used in the headers

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

    $ cd FMN_BE/
    $ yarn install
    $ yarn start

Or use an already existing API to get started:

[ForgetMENot](https://fmn-be.herokuapp.com/)

