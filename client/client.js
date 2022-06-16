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
const bg_pattern = /^bg;([A-Z\d]+);(.+)/i

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
    } else if (input.startsWith('jg;')) {
        const str = input.slice(3)
        socket.emit('join_group', {
            sender: nickname,
            action: 'join_group',
            group: str
        })
    } else if (bg_pattern.test(input)) {
        const info = input.match(bg_pattern)
        socket.emit('broadcast_group', {
            sender: nickname,
            action: 'broadcast_group',
            group: info[1],
            msg: info[2]
        })
    } else if (input.startsWith('mbr;')) {
        const str = input.slice(4)
        socket.emit('list_members_group', {
            sender: nickname,
            action: 'list_members_group',
            group: str
        })
    } else if (input.startsWith('msg;')) {
        const str = input.slice(4)
        socket.emit('list_messages_group', {
            sender: nickname,
            action: 'list_messages_group',
            group: str
        })
    } else if ('grp;' === input) {
        socket.emit('list_groups', {
            sender: nickname,
            action: 'list_groups'
        })
    } else if (input.startsWith('lg;')) {
        const str = input.slice(3)
        socket.emit('leave_group', {
            sender: nickname,
            action: 'leave_group',
            group: str
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

socket.on('send', data => {
    console.log('%s', data.msg)
})

socket.on('join_group', data => {
    console.log('[INFO]: %s has joined the group', data.sender)
})

socket.on('broadcast_group', data => {
    console.log('%s', data.msg)
})

socket.on('list_members_group', data => {
    console.log('[INFO]: List of members:')
    for (let i = data.members.length-1; i >= 0; i--) {
        console.log(data.members[i])
    }
})

socket.on('list_messages_group', data => {
    console.log('[INFO]: History of messages:')
    for (let i = data.msgs.length-1; i >= 0; i--) {
        console.log(data.msgs[i])
    }
})

socket.on('list_groups', data => {
    console.log('[INFO]: List of groups:')
    for (let i = data.groups.length-1; i >= 0; i--) {
        console.log(data.groups[i])
    }
})

socket.on('leave_group', data => {
    console.log('[INFO]: %s left the group', data.sender)
})
