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

    socket.on('join', data => {
        console.log('\n%s', data)
        console.log('Nickname: ', data.sender, ', id: ', socket.id)
        const connectedClients = io.of('/').server.engine.clientsCount
        console.log('Number of clients: %d', connectedClients)
        socket.nickname = data.sender
        socket.broadcast.emit('join', data)
    })

    socket.on('list', data => {
        console.log('\n%s', data)

        let users = []
        for (const [k, v] of io.of('/').sockets) {
            users.push(v.nickname)
        }

        socket.emit('list', {
            sender: data.sender,
            action: 'list',
            users: users
        })
    })
})
