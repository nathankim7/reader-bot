const { Command } = require('discord.js-commando')
var fs = require('fs')
const path = require('path')
const { tts, queues } = require('../../index')

function play(connection, msg) {
    var server = queues[msg.guild.id]

    tts.synthesize({
        text: server.queue[0],
        accept: 'audio/mp3',
        voice: 'en-US_AllisonVoice'
    })
    .on('error', (err) => { console.log(err) })
    .pipe(fs.createWriteStream('audio.mp3'))
    .on('close', () => {
        server.dispatcher = connection.play(path.join(__dirname, '/../../audio.mp3'))
        server.queue.shift()
        server.dispatcher.on('finish', () => {
            console.log('Finished playing!');

            if (server.queue[0])
                play(connection, msg)
            else
                connection.disconnect()
        })
    })
}

module.exports = class TextSynthCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tts',
            group: 'synth',
            memberName: 'text',
            examples: ['!!tts Hello World!'],
            description: 'stupid command made for reading fanfiction',
            args: [{
                key: 'text',
                prompt: 'Please include text to synthesize.',
                type: 'string'
            }]
        })
    }

    async run(msg, { text }) {
        if (!msg.member.voiceChannel) {
            msg.reply("You must be in a voice channel.")
            return
        }

        if (!queues[msg.guild.id]) { queues[msg.guild.id] = { queue: [] } }

        queues[msg.guild.id].queue.push(msg.member.displayName + ' said: ' + text)
        
        if (!msg.guild.voiceConnection) {
            const connection = await msg.member.voiceChannel.join()
            play(connection, msg)
        }
    }
}
