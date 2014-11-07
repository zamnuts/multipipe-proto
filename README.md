multipipe-proto
===============

A throw-away prototype used to test:

1. building a nodejs streams2 pipeline
2. tearing it down and emptying it
3. working with parallel streams
  1. uses `writable-stream-parallel` for mongodb writes and a transform
  2. `csv-transform` runs up to 10 transforms in parallel by default

The flow is (in a streams2 way):

1. Open and read a file (as a Buffer)
2. Parse it as a CSV (Buffer -> Object)
3. Transform the data (prepare as formal MongoDB doc)
4. Perform a second transform on the data
5. Write the document to MongoDB

To run/test it:

1. Put a CSV file in the `samples` dir with at least one column
2. Update `index.js`
  1. `filePath` is the relative path to the CSV
  2. `targetMongo` is a mongodb connection string (auth not supported)
  3. `targetCollection` is the name of the collection to use, this script _drops_ the collection before writing to it!
  4. `doEmpty` tells the pipeline whether or not to empty the buffer (`true` to empty, `false` to finish `drain`ing)
  5. Modify the timeout duration, or simply change the `start` callback to your liking. The point of this script is to terminate the pipeline _early_/_prematurely_ in a controlled manner, otherwise what are you really testing?
