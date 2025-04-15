// MongoDB Playground

const database = 'sample_mflix';
use(database);

db.runCommand({ collMod: "movies", changeStreamPreAndPostImages: {"enabled": true} })