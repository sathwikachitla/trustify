const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const validUrl = require('valid-url');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve the index.html file from the root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the styles.css and script.js files from the root directory
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

const mongoUri = 'mongodb+srv://22h51a05m6:A7KtbuoucxdL4LIk@cluster0.jbyz9o1.mongodb.net/';

// Add ssl and retryWrites options
const connectionOptions = {
    ssl: true,
    retryWrites: true,
    // Not needed if using driver >= 4.0.0
};

const blacklistedDb = mongoose.createConnection(`${mongoUri}blacklist`, connectionOptions);
const reportedDb = mongoose.createConnection(`${mongoUri}reported`, connectionOptions);

blacklistedDb.on('error', (error) => {
    console.error('Blacklist DB connection error:', error);
});
blacklistedDb.once('open', () => {
    console.log('Connected to Blacklist DB');
});

reportedDb.on('error', (error) => {
    console.error('Reported DB connection error:', error);
});
reportedDb.once('open', () => {
    console.log('Connected to Reported DB');
});

const urlSchema = new mongoose.Schema({
    url: String
});

const BlacklistedUrl = blacklistedDb.model('Url', urlSchema);
const ReportedUrl = reportedDb.model('Url', urlSchema);

app.post('/check-url', async (req, res) => {
    const { url } = req.body;
    if (!validUrl.isUri(url)) {
        return res.status(400).json({ message: 'Invalid URL format.' });
    }

    const blacklistedUrl = await BlacklistedUrl.findOne({ url });
    if (blacklistedUrl) {
        res.json({ message: 'The entered URL is suspicious.' });
    } else {
        res.json({ message: 'You can continue browsing on the given URL.' });
    }
});

app.post('/report-url', async (req, res) => {
    const { url } = req.body;
    if (!validUrl.isUri(url)) {
        return res.status(400).json({ message: 'Invalid URL format.' });
    }

    try {
        const newUrl = new ReportedUrl({ url });
        await newUrl.save();
        res.json({ message: 'Thank you for reporting! The website has been marked for review.' });
    } catch (error) {
        console.error('Error saving URL to the database:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/verify-url', async (req, res) => {
    const { url } = req.body;
    if (!validUrl.isUri(url)) {
        return res.status(400).json({ message: 'Invalid URL format.' });
    }

    try {
        const reportedUrl = await ReportedUrl.findOne({ url });
        if (!reportedUrl) {
            return res.status(404).json({ message: 'URL not found in the reported database.' });
        }

        const newBlacklistedUrl = new BlacklistedUrl({ url });
        await newBlacklistedUrl.save();

        await ReportedUrl.deleteOne({ url });

        res.json({ message: 'The URL has been verified and moved to the blacklist.' });
    } catch (error) {
        console.error('Error verifying URL:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server is live on http://localhost:3006');
});
