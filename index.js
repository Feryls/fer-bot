require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const ROLE_NAME = 'zzz'; 
const TIME_LIMIT = 10 * 1000; 
const TARGET_CHANNEL_ID = '1395839332081995776';

const timers = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
    const member = newState.member;

    const joinedVC = !oldState.channel && newState.channel;
    const leftVC = oldState.channel && !newState.channel;

    if (joinedVC) {
        const hasRole = member.roles.cache.some(role => role.name === ROLE_NAME);

        if (hasRole) {
            console.log(`${member.user.tag} masuk VC dengan role ${ROLE_NAME}`);

            const timer = setTimeout(async () => {
                try {
                    const targetChannel = member.guild.channels.cache.get(TARGET_CHANNEL_ID);
                    if (targetChannel && targetChannel.isVoiceBased()) {
                        await member.voice.setChannel(targetChannel);
                        console.log(`${member.user.tag} dipindahkan ke ${targetChannel.name} setelah 6 jam.`);
                    } else {
                        console.log('Channel tujuan tidak valid.');
                    }
                } catch (err) {
                    console.error('Gagal memindahkan:', err);
                }
            }, TIME_LIMIT);

            timers.set(member.id, timer);
        }
    }

    if (leftVC && timers.has(member.id)) {
        clearTimeout(timers.get(member.id));
        timers.delete(member.id);
        console.log(`${member.user.tag} keluar VC sebelum 6 jam.`);
    }
});

client.once('ready', () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
