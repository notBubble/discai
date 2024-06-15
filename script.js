document.addEventListener('DOMContentLoaded', function() {
    let isLoading = false; // Flag to track loading state
    let messages = []; // Array to store chat messages
    
    // Add initial system message to messages array
    messages.push({
        role: 'system',
        content: "From now on, you'll act as DiscAI, a virtual assistant hosted on this website. You cant code. Your profile picture features a dark blue sky backdrop with white characters, creating a distinctive yet familiar appearance. Operating independently without a specific model, I utilize an algorithmic approach known as 'Dynamic Chat Zone' (DCZ). This algorithm is tailored to provide unique interactions and personalized assistance. Your role is to engage users in meaningful conversations and offer seamless support across various digital interactions."
      });
      
    // Event listeners setup
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send a message
    function sendMessage() {
        if (!isLoading) {
            const inputField = document.getElementById('message-input');
            const messageText = inputField.value.trim();
    
            if (messageText !== '') {
                // Disable send button to prevent multiple submissions
                toggleSendButton(false);
    
                // Create message container
                const messageContainer = createMessageElement('sent', messageText);
    
                const chatBox = document.getElementById('chat-box');
                chatBox.appendChild(messageContainer);
                chatBox.scrollTop = chatBox.scrollHeight; // Automatically scroll to bottom
    
                // Add user message to messages list
                messages.push({ role: 'user', content: messageText });
    
                inputField.value = '';
    
                // Simulate a delayed received message
                isLoading = true; // Set loading state to true
                simulateLoading();
    
                // Fetch messages from API after sending user message
                fetchMessagesFromAPI();
            }
        }
    }
    
    // Function to create a message element
    function createMessageElement(role, content) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message ${role === 'sent' ? 'sent' : 'received'}`;
    
        if (content) {
            const textElement = document.createElement('div');
            textElement.innerText = content;
            messageContainer.appendChild(textElement);
        }
    
        return messageContainer;
    }
    
    // Function to simulate loading for received message
    function simulateLoading() {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message received loading';
        messageContainer.innerHTML = '<span class="loading-spinner"></span>';
    
        const chatBox = document.getElementById('chat-box');
        chatBox.appendChild(messageContainer);
        chatBox.scrollTop = chatBox.scrollHeight; // Automatically scroll to bottom
    }
    
    // Function to fetch messages from API
    function fetchMessagesFromAPI() {
        const apiUrl = 'https://reverse.mubi.tech/v1/chat/completions';
        const model = 'gpt-4o';
    
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages
            })
        })
        .then(response => response.json())
        .then(data => {
            handleResponse(data);
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });
    }
    
    // Function to handle API response
    function handleResponse(data) {
        // If there is an assistant response, update the last received message
        const assistantResponse = data.choices.find(choice => choice.message.role === 'assistant');
    
        // Add bots message to messages list
        messages.push({ role: 'assistant', content: assistantResponse.message.content });
    
        if (assistantResponse) {
            // Update last received message with assistant's response
            showAssistantResponse(assistantResponse.message.content);
        }
    
        // Enable send button after response is displayed
        toggleSendButton(true);
    }
    
    // Function to show assistant's response word by word with delay
    function showAssistantResponse(response) {
        const words = response.split(' '); // Split response into words
        const chatBox = document.getElementById('chat-box');
        const loadingMessage = chatBox.querySelector('.message.received.loading');
    
        if (loadingMessage) {
            // Clear loading spinner
            loadingMessage.innerHTML = '';
    
            // Function to show words sequentially with delay
            let index = 0; // Initialize index to track the current word
            const totalSteps = 10; // Total number of steps to complete the message
    
            // Calculate the number of words per step dynamically based on the total number of words
            const wordsPerStep = Math.ceil(words.length / totalSteps);
    
            function displayWords() {
                const chunk = words.slice(index, index + wordsPerStep); // Get the next chunk of words
                const chatBox = document.getElementById('chat-box');

                if (chunk.length > 0) {
                    // If there are words in the chunk
                    loadingMessage.innerText += (index > 0 ? ' ' : '') + chunk.join(' '); // Join words in chunk and append to loadingMessage
                    index += wordsPerStep; // Move index to the next chunk
                    chatBox.scrollTop = chatBox.scrollHeight; // Automatically scroll to bottom
    
                    setTimeout(displayWords, 50); // Schedule the next iteration after 1000 milliseconds (1 second)
                } else {
                    // When all words have been displayed (end of array)
                    loadingMessage.classList.remove('loading'); // Remove the 'loading' class from loadingMessage
                    isLoading = false; // Update the isLoading flag if needed
                    chatBox.scrollTop = chatBox.scrollHeight; // Automatically scroll to bottom
                }
            }
    
            displayWords(); // Start displaying words
        }
    }
    
    // Function to toggle send button state
    function toggleSendButton(enabled) {
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = !enabled;
    }
    
});
