/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('sample_mflix');

// Search for documents in the current collection.
db.getCollection('movies')
  .find(
    {
      _id: ObjectId("67feba61007ccaf700fa6716")
    }
  );
