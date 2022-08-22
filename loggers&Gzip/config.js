require('dotenv').config()

module.exports = {
    mongodb: {
        mongo: process.env.MONGO,
        db: process.env.DB,
        collectionMessage: process.env.COLLECTION
    }
}