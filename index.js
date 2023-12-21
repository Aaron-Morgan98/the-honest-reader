import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();


const { Client } = pg;
const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();


let currentReviewId = 1;
let userIsAuthorised = false;


app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));



//renders the homepage and fetches all the data within the review table so it can be displayed
app.get("/", async (req,res) => {
   try {
    const result = await db.query("SELECT * FROM reviews ORDER BY id DESC;");
    const reviews = result.rows;

    res.render("index.ejs",{reviews})
   } catch(err) {
    console.log(err);
   }
   console.log(userIsAuthorised);

  
});

//renders the add new post page "add.ejs"
app.get("/add", (req,res) => {
    res.render("add.ejs");
});

//renders the log in page "password.ejs"
app.get("/password", (req,res) => {
    res.render("password.ejs");
});

//renders the contact page.
app.get("/contact", (req,res) => {
res.render("contact.ejs");
});




//Checks to see if the users password they have inputted is correct, if so they will now be able to delete/edit posts.
app.post("/password", (req,res) => {
    const password = req.body.password;

    if (password === "admin123") {
        userIsAuthorised = true;
        res.redirect("/");
    } else {
        res.status(401).send("Unauthorised: Wrong password!");
    }
   
});

//This route is triggered when the "edit" button is pressed and renders "edit.ejs" with the infomation of your selected review.
//the id of the selected review is used to ensure the correct review is updated
app.post("/update", async (req,res) => {
currentReviewId = req.body.editReviewId;

try {
        const result = await db.query("SELECT * FROM reviews WHERE id = $1", [currentReviewId]);
        const review = result.rows;

        console.log(currentReviewId);
        res.render("edit.ejs", {review});
    } catch (err) {
        console.log(err);
    }

});


//handles adding a new review to the database via add.ejs
//An error is thrown if the title is missing or if the rating provided is not a number between 0-10
app.post("/add", async (req,res) => {
    const {
        titleAdd: title,
        authorAdd: author,
        reviewedByAdd: reviewedBy,
        ratingAdd: rating,
        olidAdd: olid,
        descriptionAdd: description,
      } = req.body;
      

    if (!title) {
        return res.status(400).send("Title is required.");
    }
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        return res.status(400).send("Rating must be a number between 0 and 10.");
    }


    try {
            await db.query("INSERT INTO reviews(title,author,reviewed_by,rating,olid,description) VALUES($1,$2,$3,$4,$5,$6)",
            [title, author, reviewedBy, rating, olid, description]);
            res.redirect("/");
            } catch(err) {
                console.log(err);
            }
    
});


//edits an existing post via edit.ejs
//To keep consistant with the /add route, an error is thrown if the title is missing or if the rating provided is not a number between 0-10
app.post("/edit", async (req, res) => {
    const {
        titleEdit: title,
        authorEdit: author,
        reviewedByEdit: reviewedBy,
        ratingEdit: rating,
        olidEdit: olid,
        descriptionEdit: description,
      } = req.body;

      if (!title) {
        return res.status(400).send("Title is required.");
    }
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
        return res.status(400).send("Rating must be a number between 0 and 10.");
    }


    try {
        await db.query("UPDATE reviews SET title = $1, author = $2, reviewed_by = $3, rating = $4, olid = $5, description = $6 WHERE id = $7; ", 
        [title, author, reviewedBy, rating, olid, description, currentReviewId]);
        res.redirect("/");
    } catch(err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});



//checks if user has logged in, if so they are able to delete posts
app.post("/delete", async (req,res) => {
    const id = req.body.deleteReviewId;
   
    if(userIsAuthorised) {
        await db.query("DELETE FROM reviews WHERE id = $1", [id])
        res.redirect("/");
    } else {
        res.status(401).send("Unauthorised: Please Log In");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });