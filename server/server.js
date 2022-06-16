const port = 3000
const io = require('socket.io')(port)

console.log('Server is listening on port %d', port)

io.of('/').on('connect', socket => {
    console.log('\nA client connected')

    socket.on('disconnect', reason => {
        console.log('\nA client disconnected, reason: %s', reason)
        const connectedClients = io.of('/').server.engine.clientsCount
        console.log('Number of clients: %d', connectedClients)
    })

    socket.on('broadcast', data => {
        console.log('\n%s', data)
        socket.broadcast.emit('broadcast', data)
    })
})