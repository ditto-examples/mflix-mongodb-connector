# Ditto - Sample MongoDB Connector `Movies` App

This is a sample application that demonstrates how to use the MongoDB Connector for Ditto with the **`mflix`** sample data that comes with MongoDb Atlas.  This app will filter out movies that are kids friendly and rated 'G' to show off the power of Ditto subscriptions with the MongoDb Connector.

# Prerequisites

## MongoDb Atlas 

- Basic understanding of MongoDB Atlas
- Active MongoDB Atlas account with cluster pre-configured 
- [MongoDB Shell Installed](https://www.mongodb.com/docs/mongodb-shell/)

## SwiftUI 
- Basic understanding of Swift and SwiftUI for SwiftUI app
- Xcode 16.4 or higher with Command Line Tools installed (Tested with Xcode 16.4 & Xcode 26 beta 4)

## Android with Jetpack Compose
- Basic understanding of Kotlin and Jetpack Compose for Android app
- Android Studio "Koala" 2024.1.1 or higher

## Flutter 
- Basic understanding of Dart and Flutter
- Tested with Flutter 3.27.4 and Dart 3.6.2
- Xcode 15 or higher with Command Line Tools installed (Tested with Xcode 16)
- Android SDK installed (v34 or higher) - (Tested with Android Studio Meerkat)
- IDE of choice (Visual Studio Code, Android Studio "Koala" 2024.1.1 or higher, Cursor, etc)

## React Native with Expo 
- Basic understanding of Typscript, React Native, and Expo 
- Xcode 15 or higher with Commnad Line Tools installed (Tested with XCode 16)
- Android SDK installed (v34 or higher) - (Tested with Android Studio Meerkat)
- IDE of choice (Visual Studio Code, Cursor, etc)

# Setup in MongoDB Atlas

## Setup Atlas User from within MongoDB Atlas

For this setup, we will need to create two different users.  One for setting up the Cluster and one for the Ditto MongoDB Connector.

### Create a User for managing the Cluster

Open MongoDb Atlas and make sure you are on the Cluster Overview page.

1. Click on the Database Access link under the Security section from the navigation menu on the left.
2. Under the Database Users tab, click on the `+ ADD NEW DATABASE USER` button.
3. Make sure Authentication Method is set to `Password`. 
4. Under the first field, add in the username for the user.  In the examples we will use the username `atlasAdmin`.
5. Under the Password Authentication set a password for the user. 
6. Under Database User Privileges, click the `Add Built In Role` button and select the `Atlas admin` role.
7. Click the `Add User` button.

### Create a User for the Ditto MongoDB Connector

More information about why this user is needed can be found in the [Ditto documentation](https://docs.ditto.live/cloud/mongodb-connector#create-a-mongodb-database-user).

1. Under the `Database Users` tab, click on the `+ ADD NEW DATABASE USER` button.
2. Make sure Authentication Method is set to `Password`. 
3. Under the first field, add in the username for the user.  In the examples we will use the username `connector`.
4. Under the Password Authentication set a password for the user. 
5. Under `Database User Privileges`, click the `Add Built In Role` button and select the `Read and write to any database` role.
6. Click the `Add User` button.

## Setup Atlas Networking from within MongoDB Atlas

For this setup, we will need to add the IP Addresses for Ditto Big Peer to the list of allowed IP Addresses to communicate with the MongoDB Atlas cluster.  More information can be found in the [Ditto documentation](https://docs.ditto.live/cloud/mongodb-connector#add-ditto-ips-to-mongodb-allowlist).

## Load the Sample Data

This sample application uses the default [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix/) database from the MongoDB Atlas cluster and the movies collection.  Use the [MongoDB Atlas documentation](https://www.mongodb.com/docs/guides/atlas/sample-data/) to load the sample_mflix data into your cluster before moving forward.  More information on the sample_mflix data can be found [here](https://www.mongodb.com/docs/atlas/sample-data/#std-label-load-sample-data).

This dataset was chosen because it's the default dataset that comes with MongoDB Atlas when loading sample data.

## Setup Collection Settings with the MongoDB Shell

Ditto requires the movies collection to have change stream pre and post images enabled.  The following commands update the collection in order to enable [Change Stream Pre and Post Images](https://docs.ditto.live/cloud/mongodb-connector#create-mongodb-collections).  

### Getting the MongoDb Connection String

From Atlas, click on the Clusters link under the Database section from the menu on the left.  Next, click on the Connect button under your cluster listing.

From the Connect window, select `Shell` from the list.  This should give you the connection string for your cluster.

### Running the Commands in the MongoDB Shell

With the MongoDB Shell installed, run the following commands, replacing the srv:// with the proper connection string for your cluster and `atlasAdmin` with the username you created with admin rights to the cluster:

```sh
mongosh "mongodb+srv://freecluster.abcd1.mongodb.net/sample_mflix" 
--apiVersion 1 --username atlasAdmin 
```

Once connected, run the following command to enable change stream pre and post images:

```sh
use sample_mflix 
db.runCommand({ 
    collMod: "movies", 
    changeStreamPreAndPostImages: { enabled: true } 
})
```

# Setup the Ditto MongoDB Connector

## Setup the Ditto MongoDB Connector in the Ditto Portal

The [Ditto documentation](https://docs.ditto.live/cloud/mongodb-connector#configuring-the-connector) has information about how to setup the Ditto MongoDB Connector in the Ditto Portal. 

The Step-By-Step Guide can be found [here](https://docs.ditto.live/cloud/mongodb-connector#step-by-step-guide)

## Validate the documents have been synced into Ditto 

- Log into the [Ditto Portal](https://portal.ditto.live/).  
- Select your app.
- Click on the `Collections` tab
  - You should see the movies collection with the count of documents that were synced from MongoDb Atlas.  The count should be 21,349 documents.  
  - Click the `View` link for the planets collection to see the documents in the DQL Editor.

# Setup the Flutter App 
See the provided [README.md](flutter/README.md) file for the Flutter app for instructions on how to setup and run the app.

# Setup the Expo React Native App 
See the provided [README.md](rn-expo/README.md) file for the Expo React Native app for instructions on how to setup and run the app.

# Known Limitations

An updated list of known limitations with the Ditto MongoDB Connector can be found [here](https://docs.ditto.live/cloud/mongodb-connector#current-limitations).
