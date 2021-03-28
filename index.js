const https = require('https');
const Discord = require('discord.js');
const bot = new Discord.Client();

let guild, survivalChannel;

const options = {
	hostname: 'api.mcsrvstat.us',
	port: 443,
	path: '/2/play.frinklecraft.com',
	method: 'GET'
}

bot.login(process.env.token);
bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.username}!`);
    bot.user.setActivity('FrinkleCraft', {type: 'PLAYING'})
        .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);
    guild = bot.guilds.cache.get('703532812531269633');
    survivalChannel = bot.channels.cache.get('718411946638049290');
    await getStats();
    setInterval(function(){
        getStats()
    }, 60000);

});
bot.on('message', async msg => {
    if (!msg.content.startsWith('/') || msg.author.bot) return;

    if (msg.content === '/updatestats') {
        await getStats(); return message.channel.send('Stats updated!');
        //await getStats(); return;
    }
});

function getStats() {
    console.log('Getting stats update..');
	const request = https.request(options, response => {
		let str = '';
		response.on('data', data => {
			str += data;
		});
		response.on('end', () => {
			resp = JSON.parse(str);
			let msg = resp.hostname;
			if(resp.online) {
				survivalChannel.setName("🌎 Survival ["+resp.players.online+"/"+resp.players.max+" online]");
				console.log("Survival stat channel renamed to: 🌎 Survival ["+resp.players.online+"/"+resp.players.max+" online]");
				survivalChannel.children.each(channel => channel.delete());
				if(resp.players.list) {
					resp.players.list.forEach(function (player) {
						guild.channels.create(player, {
							type: 'text',
							parent: survivalChannel
						}).then().catch(console.error);
					});
				}
			}
			else {
				survivalChannel.setName("🌎 Survival [offline]");
			}
		})
	});
	request.on('error', err => {
		console.log(err);
	});
	request.end();    
}


