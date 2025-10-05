
// =============================================================
// 2. API Endpoint (Crucial connection to your Python Cloud Function)
// =============================================================
// *** You must replace this with the HTTPS URL of your deployed Cloud Function! ***
// It will look something like: 
// "https://us-central1-asop-74f7d.cloudfunctions.net/cat_chat_function"
const FIREBASE_FUNCTION_URL = "https://catchatfunction-ruxwq3yblq-uc.a.run.app"; 



// =============================================================
// 3. Frontend Logic (Your existing chat functions)
// =============================================================

document.getElementById('start-button').addEventListener('click', startCatChat);

async function startCatChat() {
    const promptInput = document.getElementById('initial-prompt');
    const startButton = document.getElementById('start-button');
    const chatWindow = document.getElementById('chat-window');
    
    const initialPrompt = promptInput.value;

    // 1. Clear chat and show loading state
    chatWindow.innerHTML = '<div class="info-message chat-bubble">Simulation Starting... The cats are gathering. Please wait.</div>';
    startButton.disabled = true;
    promptInput.disabled = true;

    try {
        // 2. Send the request to your Python API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initial_prompt: initialPrompt })
        });

        if (!response.ok) {
            // Try to read a detailed error message from the response if possible
            const errorData = await response.json().catch(() => ({ message: 'No detailed error message provided.' }));
            throw new Error(`API failed (${response.status}): ${errorData.message}`);
        }

        // 3. Get the JSON response containing the full chat history
        const data = await response.json();
        
        if (!data.history || data.history.length === 0) {
             chatWindow.innerHTML = '<div class="info-message chat-bubble">Error: Simulation finished with no history.</div>';
             return;
        }

        // 4. Clear the loading message and display the conversation
        chatWindow.innerHTML = '';
        data.history.forEach(message => {
            appendMessage(message.name, message.content);
        });

        // 5. Scroll to the bottom of the chat
        chatWindow.scrollTop = chatWindow.scrollHeight;

    } catch (error) {
        console.error("Chat Error:", error);
        chatWindow.innerHTML += `<div class="info-message chat-bubble">A serious error occurred: ${error.message}</div>`;
    } finally {
        // 6. Reset the controls
        startButton.disabled = false;
        promptInput.disabled = false;
        appendMessage("System", "Chat simulation complete!");
    }
}

// Helper function to append a message bubble to the chat window
function appendMessage(name, content) {
    const chatWindow = document.getElementById('chat-window');
    const bubble = document.createElement('div');
    const nameClass = (name === 'CafeOwner') ? 'owner-message' : 
                      (name === 'System') ? 'info-message' :
                      'cat-message';
    
    bubble.className = `chat-bubble ${nameClass}`;
    
    // Only prepend the name for Cat/Owner messages
    if (name === 'System') {
        bubble.innerHTML = content;
    } else {
        bubble.innerHTML = `<strong>[${name}]</strong>: ${content}`;
    }
    
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}