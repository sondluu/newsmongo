// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var NoteSchema = new Schema({
  // Just a string
  name: {
    type: String
  },
  // Just a string
  note: {
    type: String
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the news model

// Create the Comments model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Export the Comments model
module.exports = Note;