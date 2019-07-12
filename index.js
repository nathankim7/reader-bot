require('dotenv').load()
const Commando = require('discord.js-commando')
const client = new Commando.Client({ 
    owner: process.env.PROFILE_ID,
    commandPrefix: '!!' 
});
const path = require('path')
var TextToSpeechV1 = require('ibm-watson/text-to-speech/v1')

module.exports = {
    tts: new TextToSpeechV1({
        username: process.env.TTS_USER,
        password: process.env.TTS_PASS,
        url: 'https://stream.watsonplatform.net/text-to-speech/api'
    }),
    queues: {}
}

client.registry.registerGroup('synth', 'Synth').registerDefaults().registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', () => { 
    console.log('ready!')
    client.user.setActivity('reading lol')
})

client.login(process.env.BOT_SECRET)
