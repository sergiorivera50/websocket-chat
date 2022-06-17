const expect = require('chai').expect
const io = require('socket.io-client')

let numTests = 1

describe('Testing server in the chat', function () {
    let alice = { nickname: 'alice' }
    let bob = { nickname: 'bob' }
    let options = { 'force new connection': true }

    beforeEach(function (done) {
        this.timeout(3000)

        console.log('>> Test #' + (numTests++))

        alice.socket = io('http://localhost:3000', options)
        bob.socket = io('http://localhost:3000', options)

        alice.socket.on('connect', function () {
            console.log(`${alice.nickname} connected`)
            alice.socket.emit('join', {
                sender: alice.nickname,
                action: 'join'
            })
        })

        bob.socket.on('connect', function () {
            console.log(`${bob.nickname} connected`)
            bob.socket.emit('join', {
                sender: bob.nickname,
                action: 'join'
            })
        })

        setTimeout(done, 500)  // call done() after 500ms
    })
    afterEach(function (done) {
        this.timeout(2000)

        alice.socket.on('disconnect', function () {
            console.log(`${alice.nickname} disconnected`)
        })

        bob.socket.on('disconnect', function () {
            console.log(`${bob.nickname} disconnected`)
        })

        alice.socket.disconnect()
        bob.socket.disconnect()

        setTimeout(done, 500)  // call done() after 500ms
    })
    it('Notify that a user joined the chat', function (done) {
        alice.socket.emit('join', {
            sender: alice.nickname,
            action: 'join'
        })
        bob.socket.on('join', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            done()
        })
    })
    it('Broadcast a message to others in the chat', function (done) {
        const hello = `Hello ${bob.nickname}`
        alice.socket.emit('broadcast', {
            sender: alice.nickname,
            action: 'broadcast',
            msg: hello
        })
        bob.socket.on('broadcast', function (data) {
            expect(data.msg).to.equal(hello)
            done()
        })
    })
    it('List all users in the chat', function (done) {
        alice.socket.emit('list', {
            sender: alice.nickname,
            action: 'list'
        })
        alice.socket.on('list', function (data) {
            expect(data.users).to.be.an('array').that.includes(alice.nickname)
            expect(data.users).to.be.an('array').that.includes(bob.nickname)
            done()
        })
    })
    it('A user quit the chat', function (done) {
        alice.socket.emit('quit', {
            sender: alice.nickname,
            action: 'quit'
        })
        bob.socket.emit('list', {
            sender: bob.nickname,
            action: 'list'
        })
        bob.socket.on('list', function (data) {
            expect(data.users).to.be.an('array').that.not.includes(alice.nickname)
            expect(data.users).to.be.an('array').that.includes(bob.nickname)
            done()
        })
    })
    it('Notify that a user quit the chat', function (done) {
        alice.socket.emit('quit', {
            sender: alice.nickname,
            action: 'quit'
        })
        bob.socket.on('quit', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            done()
        })
    })
    it('Send a private message to a user', function (done) {
        const hello = `Hello ${bob.nickname}`
        alice.socket.emit('send', {
            sender: alice.nickname,
            action: 'send',
            receiver: bob.nickname,
            msg: hello
        })
        bob.socket.on('send', function (data) {
            expect(data.receiver).to.equal(bob.nickname)
            expect(data.msg).to.equal(hello)
            done()
        })
    })
})

describe('Testing server in a group', function () {
    let alice = { nickname: 'alice' }
    let bob = { nickname: 'bob' }
    let group = 'doctors'
    let options = { 'force new connection': true }

    beforeEach(function (done) {
        this.timeout(3000)

        console.log('>> Test #' + (numTests++))

        alice.socket = io('http://localhost:3000', options)
        bob.socket = io('http://localhost:3000', options)

        alice.socket.on('connect', function () {
            console.log(`${alice.nickname} connected`)
            alice.socket.emit('join', {
                sender: alice.nickname,
                action: 'join'
            })
            alice.socket.emit('join_group', {
                sender: alice.nickname,
                action: 'join_group',
                group: group
            })
        })

        bob.socket.on('connect', function () {
            console.log(`${bob.nickname} connected`)
            bob.socket.emit('join', {
                sender: bob.nickname,
                action: 'join'
            })
            bob.socket.emit('join_group', {
                sender: bob.nickname,
                action: 'join_group',
                group: group
            })
        })

        setTimeout(done, 500)
    })
    afterEach(function (done) {
        this.timeout(2000)

        alice.socket.on('disconnect', function () {
            console.log(`${alice.nickname} disconnected`)
        })

        bob.socket.on('disconnect', function () {
            console.log(`${bob.nickname} disconnected`)
        })

        alice.socket.disconnect()
        bob.socket.disconnect()

        setTimeout(done, 500)
    })
    it('Notify that a user joined a group', function (done) {
        alice.socket.emit('join_group', {
            sender: alice.nickname,
            action: 'join_group',
            group: group
        })
        alice.socket.on('join_group', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            expect(data.group).to.equal(group)
            done()
        })
    })
    it('Broadcast a message to a group', function (done) {
        const hello = `Hello ${bob.nickname}`
        alice.socket.emit('broadcast_group', {
            sender: alice.nickname,
            action: 'broadcast_group',
            group: group,
            msg: hello
        })
        bob.socket.on('broadcast_group', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            expect(data.group).to.equal(group)
            expect(data.msg).to.equal(hello)
            done()
        })
    })
    it('List all clients that are inside a group', function (done) {
        alice.socket.emit('list_members_group', {
            sender: alice.nickname,
            action: 'list_members_group',
            group: group
        })
        alice.socket.on('list_members_group', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            expect(data.group).to.equal(group)
            expect(data.members).to.be.an('array').that.includes(alice.nickname)
            expect(data.members).to.be.an('array').that.includes(bob.nickname)
            done()
        })
    })
    it('List the existing groups', function (done) {
        alice.socket.emit('list_groups', {
            sender: alice.nickname,
            action: 'list_groups'
        })
        alice.socket.on('list_groups', function (data) {
            expect(data.sender).to.equal(alice.nickname)
            expect(data.groups).to.be.an('array').that.includes(group)
            done()
        })
    })
})