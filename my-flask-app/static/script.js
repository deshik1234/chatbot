document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const newChatBtn = document.getElementById('new-chat-btn');
    const deleteChatBtn = document.getElementById('delete-chat-btn');

    // Load chat history on page load
    fetch('/history')
        .then(res => res.json())
        .then(history => {
            history.forEach(msg => addMessage(msg.role, msg.content));
            chatHistory.scrollTop = chatHistory.scrollHeight;
        });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message);
        userInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Show loading indicator
        const loadingMsg = addMessage('assistant', '...');
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const res = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            loadingMsg.querySelector('.message-content').textContent = data.response;
        } catch (err) {
            loadingMsg.querySelector('.message-content').textContent = "Sorry, something went wrong.";
        }
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    function addMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = role === 'user' ? 'You' : 'AI';

        // Message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(contentDiv);
        chatHistory.appendChild(msgDiv);
        return msgDiv;
    }

    // New Chat button
    newChatBtn.addEventListener('click', async () => {
        await fetch('/clear_history', { method: 'POST' });
        chatHistory.innerHTML = '';
    });

    // Delete Chat button
    deleteChatBtn.addEventListener('click', async () => {
        await fetch('/delete_chat', { method: 'POST' });
        chatHistory.innerHTML = '';
    });
});