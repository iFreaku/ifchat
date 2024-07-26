const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;

function createConnection() {
    localConnection = new RTCPeerConnection();
    sendChannel = localConnection.createDataChannel('sendChannel');
    sendChannel.onmessage = handleMessage;
    sendChannel.onopen = handleChannelStatusChange;
    sendChannel.onclose = handleChannelStatusChange;

    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelCallback;

    localConnection.onicecandidate = e => !e.candidate || remoteConnection.addIceCandidate(e.candidate).catch(handleAddCandidateError);
    remoteConnection.onicecandidate = e => !e.candidate || localConnection.addIceCandidate(e.candidate).catch(handleAddCandidateError);

    localConnection.createOffer().then(offer => localConnection.setLocalDescription(offer)).then(() => remoteConnection.setRemoteDescription(localConnection.localDescription)).then(() => remoteConnection.createAnswer()).then(answer => remoteConnection.setLocalDescription(answer)).then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message !== '') {
        displayMessage(message, 'user');
        sendChannel.send(message);
        chatInput.value = '';
    }
}

function handleMessage(event) {
    displayMessage(event.data, 'bot');
}

function handleChannelStatusChange(event) {
    if (sendChannel) {
        const state = sendChannel.readyState;
        if (state === "open") {
            chatInput.disabled = false;
            chatInput.focus();
            sendBtn.disabled = false;
        } else {
            chatInput.disabled = true;
            sendBtn.disabled = true;
        }
    }
}

function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleMessage;
    receiveChannel.onopen = handleChannelStatusChange;
    receiveChannel.onclose = handleChannelStatusChange;
}

function handleAddCandidateError() {
    console.error("Error adding candidate");
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

createConnection();
