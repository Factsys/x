require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});
const fs = require('fs');
const path = require('path');

let snipes = {};

client.on('messageDelete', msg => {
    if (!msg.guild || msg.author?.bot) return;
    if (!snipes[msg.guild.id]) snipes[msg.guild.id] = [];
    snipes[msg.guild.id].unshift({
        content: msg.content,
        author: msg.author.tag,
        time: new Date(),
        selfDeleted: msg.author.id === client.user.id
    });
    snipes[msg.guild.id] = snipes[msg.guild.id].slice(0, 100);
});

client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!command.startsWith(',')) return;
    const cmd = command.slice(1);

    if (cmd === "s" || cmd === "snipe") {
        const page = parseInt(args[0]) || 1;
        const list = snipes[message.guild.id] || [];
        const snipe = list[page - 1];
        if (!snipe) return message.reply("No snipes found for that page.");
        message.channel.send(`**Snipe [Page ${page}]**
**Author:** ${snipe.author}
**Content:** ${snipe.content || "*No content*"}
**Deleted by:** ${snipe.selfDeleted ? "Author" : "Unknown"}`);
    }

    if (cmd === "mess") {
        if (!message.member.permissions.has('ModerateMembers')) return;
        const user = message.mentions.users.first();
        const dmMsg = args.slice(1).join(" ");
        if (user && dmMsg) user.send(dmMsg).then(() => message.reply("Message sent."));
    }

    if (cmd === "re") {
        if (!message.member.permissions.has('ManageNicknames')) return;
        const member = message.mentions.members.first();
        const newNick = args.slice(1).join(" ");
        if (member && newNick) member.setNickname(newNick).then(() => message.reply("Nickname changed."));
    }

    if (cmd === "help") {
        message.channel.send(`**SnipeBot v1.0.0 - Commands**
,s or ,snipe [page]
,mess @User [message]
,re @User [NewNickname]
,help`);
    }
});

client.login(process.env.DISCORD_TOKEN);
