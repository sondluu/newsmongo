/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// Dependencies
var express = require("express"); // -----YES
var bodyParser = require("body-parser"); // ---- YES
var logger = require("morgan");
var mongoose = require("mongoose"); // ---- YES
// Requiring our Note and Article models
var Note = require("./models/comments.js"); // --- YES
var Article = require("./models/news.js"); // --- YES
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio"); //----- YES
// Set mongoose to leverage built in JavaScript ES6 Promises ---- YES
mongoose.Promise = Promise;


// Initialize Express ------- YES
var app = express();

// Use morgan and body parser with our app ------ YES
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database connection configuration with mongoose ------- YES
var db = "mongodb://localhost/newsmongo"||process.env.MONGODB_URI
mongoose.connect(db, function(error){
  if (error) {throw error}
    else {
      console.log("Mongoose connection successful.");
    }

}); //this is to connect with mongo local database, or if not, would look for process environment of mongo in production (meaning being run by another server, not local)


// Show any mongoose errors
// db.on("error", function(error) {
//   console.log("Mongoose Error: ", error);
// });

// Once logged in to the db through mongoose, log a success message ----- YES
// db.once("open", function() {
//   console.log("Mongoose connection successful.");
// });


// Routes
// ======

// A GET request to scrape the echojs website ---- YES
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request ---- YES
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector --- YES
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following: --- YES
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text --- YES
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB --- YES
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array --- YES
  Article.find({}, function(error, doc) {
    // Log any errors -- YES
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object --- YES
    else {
      res.json(doc);
    }
  });
});





// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Grab an notes by article id
app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Notes.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/addnote/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update its note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors --- YES
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser --- YES
          res.send(doc);
        }
      });
    }
  });
});


// Delete comment for article --- YES
app.get('/deletenote/:id', function(req, res){
  console.log(req.params.id)
  Note.remove({'_id': req.params.id}).exec(function(err, data){
    if(err){
      console.log(err);
    } else {
      console.log("Note deleted");
    }
  })
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
