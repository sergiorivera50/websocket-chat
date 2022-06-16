const io = require('socket.io-client')
const server = 'http://localhost:3000'
const socket = io(server)

let nickname

console.log('Connecting to %s...', server)

socket.on('connect', () => {
    nickname = process.argv[2]
    console.log('[INFO]: Welcome %s', nickname)

    socket.emit('join', {
        sender: nickname,
        action: 'join'
    })
})

socket.on('disconnect', reason => {
    console.log('[INFO]: Client disconnected, reason: %s', reason)
})

const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const s_pattern = /^s;([A-Z\d]+);(.+)/i

rl.on('line', input => {
    if (input.startsWith('b;')) {
        const str = input.slice(2)
        socket.emit('broadcast', {
            sender: nickname,
            action: 'broadcast',
            msg: str
        })
    } else if ('ls;' === input) {
        socket.emit('list', {
            sender: nickname,
            action: 'list'
        })
    } else if ('q;' === input) {
        socket.emit('quit', {
            sender: nickname,
            action: 'quit'
        })
    } else if ('tr;' === input) {
        socket.emit('trace')
    } else if (s_pattern.test(input)) {
        const info = input.match(s_pattern)
        socket.emit('send', {
            sender: nickname,
            action: 'send',
            receiver: info[1],
            msg: info[2]
        })
    }
})

socket.on('broadcast', data => {
    console.log('%s', data.msg)
})

socket.on('join', data => {
    console.log('[INFO]: %s has joined the chat', data.sender)
})

socket.on('list', data => {
    console.log('[INFO] List of nicknames:')
    for (let i = 0; i < data.users.length; i++) {
        console.log(data.users[i])
    }
})

socket.on('quit', data => {
    console.log('[INFO] %s quit the chat', data.sender)
})

socket.on('send', (data) => {
    console.log('%s', data.msg)
})
