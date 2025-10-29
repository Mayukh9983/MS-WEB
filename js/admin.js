document.addEventListener('DOMContentLoaded', async () => {
    const token = getCookie('token');

    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth-check');
        const data = await response.json();
        if (!data.isAuthenticated || data.role !== 'admin') {
            window.location.href = 'admin-login.html';
            return;
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        window.location.href = 'admin-login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            deleteCookie('token');
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });

    // Course Management
    const courseForm = document.getElementById('course-form');
    const courseList = document.getElementById('courses-list');

    async function fetchCourses() {
        const response = await fetch('/api/courses');
        const courses = await response.json();
        courseList.innerHTML = courses.map(course => `
            <div class="course-item-admin">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <button class="btn btn-secondary" onclick="editCourse(${course.id}, '${course.title}', '${course.description}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
            </div>
        `).join('');
    }

    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('course-id').value;
        const title = document.getElementById('course-title').value;
        const description = document.getElementById('course-description').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/courses/${id}` : '/api/courses';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });

        courseForm.reset();
        fetchCourses();
    });

    window.editCourse = (id, title, description) => {
        document.getElementById('course-id').value = id;
        document.getElementById('course-title').value = title;
        document.getElementById('course-description').value = description;
    };

    window.deleteCourse = async (id) => {
        if (confirm('Are you sure you want to delete this course?')) {
            await fetch(`/api/courses/${id}`, { method: 'DELETE' });
            fetchCourses();
        }
    };

    // MCQ Management
    const mcqForm = document.getElementById('mcq-form');
    const mcqList = document.getElementById('mcqs-list');

    async function fetchMcqs() {
        const response = await fetch('/api/mcqs');
        const mcqs = await response.json();
        mcqList.innerHTML = mcqs.map(mcq => `
            <div class="mcq-item-admin">
                <p><strong>Q:</strong> ${mcq.question}</p>
                <ul>
                    <li>A: ${mcq.options.A}</li>
                    <li>B: ${mcq.options.B}</li>
                    <li>C: ${mcq.options.C}</li>
                    <li>D: ${mcq.options.D}</li>
                </ul>
                <p><strong>Correct Answer:</strong> ${mcq.correctAnswer}</p>
                <button class="btn btn-danger" onclick="deleteMcq(${mcq.id})">Delete</button>
            </div>
        `).join('');
    }

    mcqForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = document.getElementById('mcq-question').value;
        const options = {
            A: document.getElementById('mcq-option-a').value,
            B: document.getElementById('mcq-option-b').value,
            C: document.getElementById('mcq-option-c').value,
            D: document.getElementById('mcq-option-d').value
        };
        const correctAnswer = document.getElementById('mcq-correct-answer').value;

        await fetch('/api/mcqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options, correctAnswer })
        });

        mcqForm.reset();
        fetchMcqs();
    });

    window.deleteMcq = async (id) => {
        if (confirm('Are you sure you want to delete this MCQ?')) {
            await fetch(`/api/mcqs/${id}`, { method: 'DELETE' });
            fetchMcqs();
        }
    };

    // Submissions
    const submissionsList = document.getElementById('submissions-list');
    async function fetchSubmissions() {
        const response = await fetch('/api/submissions');
        const submissions = await response.json();
        submissionsList.innerHTML = submissions.map(submission => `
            <div class="submission-item">
                <p><strong>Student:</strong> ${submission.studentName}</p>
                <p><strong>Score:</strong> ${submission.score}</p>
                <p><strong>Date:</strong> ${new Date(submission.date).toLocaleString()}</p>
            </div>
        `).join('');
    }

    // Contact Messages
    const contactMessagesList = document.getElementById('contact-messages-list');
    async function fetchContactMessages() {
        const response = await fetch('/api/contact-messages'); // This endpoint needs to be created
        const messages = await response.json();
        contactMessagesList.innerHTML = messages.map(message => `
            <div class="contact-message-item">
                <p><strong>From:</strong> ${message.name} (${message.email})</p>
                <p><strong>Subject:</strong> ${message.subject}</p>
                <p><strong>Message:</strong> ${message.message}</p>
                <p><strong>Date:</strong> ${new Date(message.date).toLocaleString()}</p>
            </div>
        `).join('');
    }

    function getCookie(name) {
        const value = inaly ${document.cookie}`;
        const parts = value.split(inaly ${name}=inaly);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function deleteCookie(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // Initial fetches
    fetchCourses();
    fetchMcqs();
    fetchSubmissions();
    fetchContactMessages();
});