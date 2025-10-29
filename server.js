const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const lockfile = require('proper-lockfile');

const app = express();
const port = 3000;
const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Change this to a long, random string in a real application

if (secretKey === 'your_secret_key') {
    console.warn('Warning: JWT_SECRET is not set. Using a default secret key for development purposes only. Please set a strong, random secret in your environment variables for production.');
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

const dbPath = path.join(__dirname, 'db', 'db.json');

async function readDb() {
    try {
        await lockfile.lock(dbPath, { retries: 5 });
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        return { users: [], courses: [], mcqs: [], studentSubmissions: [], admins: [], contactMessages: [] };
    } finally {
        await lockfile.unlock(dbPath);
    }
}

async function writeDb(data) {
    try {
        await lockfile.lock(dbPath, { retries: 5 });
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to database:', error);
    } finally {
        await lockfile.unlock(dbPath);
    }
}

// Middleware to check for admin authentication
function isAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await readDb();
    const admin = db.admins.find(a => a.username === username);

    if (admin && bcrypt.compareSync(password, admin.password)) {
        const token = jwt.sign({ username: admin.username, role: 'admin' }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: false }); // Set secure: true in production
        res.json({ success: true, message: 'Admin login successful' });
    } else {
        res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logout successful' });
});

app.get('/api/auth-check', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ isAuthenticated: false });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        res.json({ isAuthenticated: true, role: decoded.role });
    } catch (error) {
        res.json({ isAuthenticated: false });
    }
});

app.get('/api/mcqs', async (req, res) => {
    const db = await readDb();
    res.json(db.mcqs);
});

app.post('/api/mcqs', isAdmin, async (req, res) => {
    const newMcq = req.body;
    const db = await readDb();
    newMcq.id = Date.now();
    db.mcqs.push(newMcq);
    await writeDb(db);
    res.json({ success: true, mcq: newMcq });
});

app.delete('/api/mcqs/:id', isAdmin, async (req, res) => {
    const mcqId = parseInt(req.params.id, 10);
    const db = await readDb();
    const index = db.mcqs.findIndex(mcq => mcq.id === mcqId);

    if (index !== -1) {
        db.mcqs.splice(index, 1);
        await writeDb(db);
        res.json({ success: true, message: 'MCQ deleted successfully' });
    } else {
        res.status(404).json({ error: 'MCQ not found' });
    }
});

app.get('/api/admins', isAdmin, async (req, res) => {
    const db = await readDb();
    res.json(db.admins.map(a => ({ id: a.id, username: a.username })));
});

app.post('/api/admins', isAdmin, async (req, res) => {
    const { username, password } = req.body;
    const db = await readDb();
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newAdmin = {
        id: Date.now(),
        username,
        password: hashedPassword
    };
    db.admins.push(newAdmin);
    await writeDb(db);
    res.json({ success: true, admin: { id: newAdmin.id, username: newAdmin.username } });
});

app.get('/api/submissions', isAdmin, async (req, res) => {
    const db = await readDb();
    res.json(db.studentSubmissions);
});

app.post('/api/submissions', async (req, res) => {
    const submission = req.body;
    const db = await readDb();
    submission.id = Date.now();
    db.studentSubmissions.push(submission);
    await writeDb(db);
    res.json({ success: true, message: 'Submission received' });
});

app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const db = await readDb();
    const newContactMessage = { id: Date.now(), name, email, subject, message, date: new Date() };
    db.contactMessages.push(newContactMessage);
    await writeDb(db);
    res.json({ success: true, message: 'Message sent successfully!' });
});

app.get('/api/courses', async (req, res) => {
    const db = await readDb();
    res.json(db.courses);
});

app.post('/api/courses', isAdmin, async (req, res) => {
    const newCourse = req.body;
    const db = await readDb();
    newCourse.id = Date.now();
    db.courses.push(newCourse);
    await writeDb(db);
    res.json({ success: true, course: newCourse });
});

app.put('/api/courses/:id', isAdmin, async (req, res) => {
    const courseId = parseInt(req.params.id, 10);
    const updatedCourse = req.body;
    const db = await readDb();
    const index = db.courses.findIndex(course => course.id === courseId);

    if (index !== -1) {
        db.courses[index] = { ...db.courses[index], ...updatedCourse };
        await writeDb(db);
        res.json({ success: true, course: db.courses[index] });
    } else {
        res.status(404).json({ error: 'Course not found' });
    }
});

app.delete('/api/courses/:id', isAdmin, async (req, res) => {
    const courseId = parseInt(req.params.id, 10);
    const db = await readDb();
    const index = db.courses.findIndex(course => course.id === courseId);

    if (index !== -1) {
        db.courses.splice(index, 1);
        await writeDb(db);
        res.json({ success: true, message: 'Course deleted successfully' });
    } else {
        res.status(404).json({ error: 'Course not found' });
    }
});

app.get('/api/contact-messages', isAdmin, async (req, res) => {
    const db = await readDb();
    res.json(db.contactMessages);
});
    console.log(`Server listening at http://localhost:${port}`);
});