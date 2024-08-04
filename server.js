// const express = require('express');
// const mongoose = require('mongoose');

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json());

// mongoose.connect('mongodb://localhost:27017/test', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB...', err));

// app.get('/', (req, res) => {
//     res.send('Hello, world!');
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friends');
const postRoutes = require('./routes/posts');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/users', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/posts', postRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
