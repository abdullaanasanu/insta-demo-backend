const bodyParser = require('body-parser');
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config()
const app = express()

app.use(cors())

app.use(bodyParser.json())

main().catch(err => console.log(err));

require('./models/User');
require('./models/Post');
require('./models/Follow');
require('./models/Like');
require('./models/Comment');

app.use('/',require('./routers'))

app.use('/public', express.static('public'))

async function main() {
  await mongoose.connect(process.env.MONGOOSE_DB_CONNECT);
  console.log('DB Connected!');
}

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(process.env.PORT, () => console.log('Insta Backend is running at PORT: '+process.env.PORT))