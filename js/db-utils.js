
// js/db-utils.js

// Function to get MCQs from the server
async function getMcqs() {
    try {
        const response = await fetch('/api/mcqs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting MCQs:", error);
        return [];
    }
}

// Function to add an MCQ
async function addMcq(mcq) {
    try {
        const response = await fetch('/api/mcqs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mcq),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding MCQ:", error);
        return { success: false, message: "An error occurred." };
    }
}

// Function to delete an MCQ
async function deleteMcq(mcqId) {
    try {
        const response = await fetch(`/api/mcqs/${mcqId}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting MCQ:", error);
        return { success: false, message: "An error occurred." };
    }
}

// Function to add a student submission
async function addStudentSubmission(submission) {
    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding student submission:", error);
        return { success: false, message: "An error occurred." };
    }
}

// Function to get admins from the server
async function getAdmins() {
    try {
        const response = await fetch('/api/admins');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error getting admins:", error);
        return [];
    }
}

// Function to add an admin
async function addAdmin(username, password) {
    try {
        const response = await fetch('/api/admins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding admin:", error);
        return { success: false, message: "An error occurred." };
    }
}
