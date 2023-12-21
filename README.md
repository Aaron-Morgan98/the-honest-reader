# the-honest-reader

**##Overview**

This project uses CRUD methods (create,read,update and delete) to display book reviews. Users are able to create and edit new reviews. In order to delete posts, you need to log in using a password.

The data created using the website persists thanks to a database.

The Open Library public API was also utlised in order to fetch book cover images. 

Created using node.Js, express.Js and PostgreSQL.




**##How to set up**

please run -
npm i
nodemon index.js

This will set up the website itself. Please see below step in order to create a suitable database -

CREATE TABLE <table_name> (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50),
  author VARCHAR(50),
  reviewed_by VARCHAR(50),
  rating INT,
  olid VARCHAR(10),
  description VARCHAR(3000)
);







