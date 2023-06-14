const socket = io()
const sendButton = document.getElementById('send')
const messageInput = document.getElementById('message')
const messageForm = document.getElementById('messageForm')
const sendLocationButton = document.getElementById('sendLocation')
const messagesDiv = document.getElementById('messages')
const sidebarDiv = document.getElementById('sidebarDiv')

//Templates
const messageTemplate = document.getElementById('messageTemplate').innerHTML
const locationMessageTemplate = document.getElementById('locationMessageTemplate').innerHTML
const sidebarTemplate = document.getElementById('sidebarTemplate').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
const autoscroll = () => {
    const newMessage = messagesDiv.lastElementChild
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    const visibleHeight = messagesDiv.offsetHeight
    const containerHeight = messagesDiv.scrollHeight
    const scrollOffset = messagesDiv.scrollTop + visibleHeight

    if (Math.round(containerHeight - newMessageHeight-1) <= Match.round(scrollOffset)) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messagesDiv.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messagesDiv.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    sidebarDiv.innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', 
        messageInput.value, 
        (error) => {
            sendButton.removeAttribute('disabled')
            messageInput.value = ''
            messageInput.focus()
            if(error) {
                return console.log(error)
            }
            console.log('message delivered')
        }
    )
})

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your user')
    }
    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', 
            {
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude
            },
            () => {
                sendLocationButton.removeAttribute('disabled')
                console.log('Location shared!')
            })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})