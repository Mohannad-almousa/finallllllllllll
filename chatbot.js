// =========================== Elements ===========================
const chatIcon = document.querySelector('.chat-icon');
const chatWrapper = document.querySelector('.chat-wrapper');
const closeBtn = document.querySelector('.close-btn');
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');

// =========================== Load State ===========================
window.addEventListener("load", () => {
    if (localStorage.getItem("chatOpen") === "true") {
        chatWrapper.style.display = "flex";
    }
    loadMessages();
});

// =========================== Open / Close ===========================
chatIcon.onclick = () => {
    chatWrapper.style.display = "flex";
    localStorage.setItem("chatOpen", "true");
};

closeBtn.onclick = () => {
    chatWrapper.style.display = "none";
    localStorage.setItem("chatOpen", "false");
};

// =========================== Send Message ===========================
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Function to send message
async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    // Send message to chatbot
    const response = await sendToChatbot(message);
    addMessage(response, "bot");
}

/**
 * Sends the user's message along with context (Level/Module) to the n8n Chatbot.
 * @param {string} userMessage - The text entered by the student.
 * @returns {Promise<string>} - The AI's response.
 */
async function sendToChatbot(userMessage) {
    
    // 1. Retrieve current context data (Game Module & User Level)
    const currentLevel = "Beginner"; // Placeholder: Replace with actual user level variable
    const currentModule = "Literature Review Sorting Task"; // Placeholder: Replace with actual active module name

    try {
        // 2. Prepare data and send POST request to n8n Webhook
        const response = await fetch('https://anwarq.app.n8n.cloud/webhook/research-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,         // The student's question
                current_level: currentLevel,  // Context: Current Level
                current_module: currentModule // Context: Current Game Module
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.answer; // Returns the clean answer from AI

    } catch (error) {
        console.error("Error connecting to Chatbot:", error);
        return "Sorry, I am having trouble connecting to the server right now.";
    }
}

// =========================== Add Message ===========================
function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.setAttribute("dir", "auto");
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    const messages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    messages.push({ text, type });
    localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Load saved messages from localStorage
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    messages.forEach(m => {
        const msg = document.createElement("div");
        msg.className = "msg " + m.type;
        msg.setAttribute("dir", "auto");
        msg.textContent = m.text;
        chatBox.appendChild(msg);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}