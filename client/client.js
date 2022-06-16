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

rl.on('line', input => {
    if (input.startsWith('b;')) {
        let str = input.slice(2)
        socket.emit('broadcast', {
            sender: nickname,
            action: 'broadcast',
            msg: str
        })
    }
})

socket.on('broadcast', data => {
    console.log('%s', data.msg)
})

socket.on('join', data => {
    console.log('[INFO]: %s has joined the chat', data.sender)
})
