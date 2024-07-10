function handleChatbotClose() {
  var dropdownChatbot = document.querySelector('.dropdown-chatbot');
  var dropdownToggle = dropdownChatbot.querySelector('.dropdown-toggle');
  var dropdownMenu = dropdownChatbot.querySelector('.dropdown-menu');
  
  dropdownToggle.classList.remove('show');
  dropdownMenu.classList.remove('show');
  
  dropdownToggle.setAttribute('aria-expanded', 'false');
}

var chatbotCloseButton = document.querySelector('.chatbot-close');
chatbotCloseButton.addEventListener('click', handleChatbotClose);

// MOBILE HIDDEN
document.addEventListener('DOMContentLoaded', function() {
  const dropdownChatbot = document.querySelector('.dropdown-chatbot');
  const dropdownToggle = dropdownChatbot.querySelector('.dropdown-toggle');
  const chatbotClose = dropdownChatbot.querySelector('.chatbot-close');

  dropdownToggle.addEventListener('click', function(e) {
    e.preventDefault();
    document.body.classList.add('hidden');
  });

  chatbotClose.addEventListener('click', function(e) {
    e.preventDefault();
    document.body.classList.remove('hidden');
  });
});

// CHATBOX-INPUT
const inputElement = document.querySelector('.input-chatbot');
const recordButton = document.querySelector('.chatbot-record');
const sendButton = document.querySelector('.chatbot-send');
const deleteButton = document.querySelector('.text-delete');

function toggleButtonsVisibility() {
  if (inputElement.value.trim() !== '') {
    recordButton.classList.add('d-none'); 
    sendButton.classList.remove('d-none'); 
    deleteButton.classList.remove('d-none'); 
  } else {
    recordButton.classList.remove('d-none'); 
    sendButton.classList.add('d-none'); 
    deleteButton.classList.add('d-none');
  }
}

inputElement.addEventListener('input', toggleButtonsVisibility);
deleteButton.addEventListener('click', function() {
  inputElement.value = ''; 
  inputElement.focus(); 
  toggleButtonsVisibility(); 
});

// AUDIO-CHANGE
document.querySelector('.chatbot-record').addEventListener('click', function() {
  document.querySelector('.type-box').classList.add('d-none');
  document.querySelector('.audio-recording').classList.remove('d-none');
});

document.querySelector('.btn-delete').addEventListener('click', function() {
  document.querySelector('.audio-recording').classList.add('d-none');
  document.querySelector('.type-box').classList.remove('d-none');
});