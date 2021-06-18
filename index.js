/*
Titouan Schotté (alias Titoune#1870)
Bot Discord Twitter

Description:
Ce bot renvoie automatiquement les twitts des utilisateurs souhaités (voir le fichier "accounts.txt") dans un channel bien défini avec un timeout très court.
 */

//IMPORTS
const Twit = require('twit')
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();
const config = require('./config.json');
const fs = require('fs');






//FUNCTIONS
function CreateEmbed(channel, message){
  const embed = new MessageEmbed().setColor(0xff0000).setDescription(message).setTimestamp().setFooter('Bot créé par Titoune#1870')
  channel.send(embed)
}


function MAJ(){
  var uId = [],
      uName = [];
  try {
    const data = fs.readFileSync('accounts.txt', 'UTF-8'),
    lines = data.split(/\r?\n/);

    lines.forEach((line) => {
      var account = line.split(',');
      uId.push(account[1]);
      uName.push(account[0]);
    });

  } catch (err) {
    console.error(err);
  }
  return [uId,uName];
}


function GetUserChannelId(username){
  var channelfinalId = ""
  try {
    const data = fs.readFileSync('accounts.txt', 'UTF-8'),
    lines = data.split(/\r?\n/);

    lines.forEach((line) => {
      var account = line.split(',');
      if(username == account[0]){
        switch(account[2]){
          case "aio":
            //AIO
            channelfinalId = config.CHANNEL1;
            break;
          case "raffle":
            //RAFFLE
            channelfinalId = config.CHANNEL2;
            break;
          case "script":
            //SCRIPT
            channelfinalId = config.CHANNEL3;
            break;
          default:
            //TWITTER FAST
            channelfinalId = config.CHANNEL4;
            break;
        }
      }
    });

  } catch (err) {
    console.error(err);

  return channelfinalId;
}
}








//PROGRAMME PRINCIPAL
var userIds = MAJ()[0],
userlist = MAJ()[1];
console.log(userIds)


//Twitter config
var T = new Twit({
  consumer_key:         config.CONSUMER_KEY,
  consumer_secret:      config.CONSUMER_SECRET,
  access_token:         config.ACCESS_TOKEN,
  access_token_secret:  config.ACCESS_TOKEN_SECRET,
  timeout_ms:           0,
  strictSSL:            true,
})


/*Events*/
client.once('ready', () => {
  console.log("Logged as " + `${client.user.tag}`);
  const statuses = ['Brigade Fantôme', 'Twitter'];
  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i], {type: 'PLAYING'});
    i = ++i % statuses.length;

  }, 1e4)

  var stream = T.stream('statuses/filter', { follow: userIds })
  stream.on('tweet', function (tweet) {
    var url = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
    try {
      var channelIdForTheUser = GetUserChannelId(tweet.user.screen_name),
      verif = false;
      for(let z = 0; z <  userlist.length; z++){
        if(tweet.user.screen_name == userlist[z]){
          console.log('Not an impostor');
          verif = true;
        }
      }
      // let channel = client.channels.fetch(channelIdForTheUser).then(channel => {

        if(verif){
          client.channels.cache.get(channelIdForTheUser).send(url)
          client.channels.cache.get(config.CHANNELLOG).send(url)
          console.log("NEW TWITT : " + tweet.user.screen_name + " on " + url);
        } else {
          console.log("IMPOSTOR TWITT : " + tweet.user.screen_name + " on " + url);
        }
    } catch (error) {
      console.error(error);
    }
  })

})




//COMMANDS
client.on('message', message => {
  if(!message.author.bot){



    //TF COMMAND
    if (message.content === config.prefix + "twitterfast" || message.content === config.prefix + "tf") {
      try{
        userIds = MAJ()[0];
        userlist = MAJ()[1];
      } catch (error) {
      }
      var authorsTwitt = "";
      for(let t = 0; t <  userlist.length; t++){
        authorsTwitt += "\n - " + "@"+ userlist[t];
      }
      //embed
      const embed = new MessageEmbed().setAuthor('TwitterFast', client.user.avatarURL(), 'https://github.com/Titouan-Schotte').setTitle('__Configuration :__').setColor(0x00b9ff).setDescription('\n\nVoici la liste des comptes inclus : \n' +authorsTwitt + "\n\n").setTimestamp().setFooter('Bot créé par Titoune#1870')
      message.channel.send(embed);
    }



    //ADD ACCOUNT
    if (message.content.indexOf(config.prefix +'tfadd') !== -1 && message.member.hasPermission('ADMINISTRATOR')) {
      var splitter=message.content.split(' '),
          reqId=splitter[2],
          reqUserName=splitter[1],
          reqCat=splitter[3];
      if(!isNaN(reqId) && reqId.length == 19){
        if(reqCat == 'aio' || reqCat == 'script' || reqCat == 'raffle' || reqCat == 'twitterfast'){
          if(reqUserName.indexOf('@') !== -1){
            reqUserName = reqUserName.replace('@', '')
            console.log(reqUserName)
          }

          let filter = m => m.author.id === message.author.id;
          //embed
          const embed = new MessageEmbed().setAuthor('TwitterFast', client.user.avatarURL(), 'https://github.com/Titouan-Schotte')
              .setTitle('1/ __Ajout d\'un compte :__')
              .setColor(0x00008B)
              .setDescription('Vous êtes sur le point d\' ajouter un compte dans les fichiers du bot !')
              .addFields({ name: '\u200B', value: '\u200B' },{ name: 'ATTENTION', value: 'Si le compte que vous ajoutez est invalide le bot crashera ! :eyes:' },
                  { name: '\u200B', value: '\u200B' },
                  { name: 'Valider', value: 'Entrez "**YES**"', inline: true },
                  { name: 'Annuler', value: 'Entrez "**NO**"', inline: true },
                  { name: '\u200B', value: '\u200B' },
              )
              .setTimestamp()
              .setFooter('Bot créé par Titoune#1870')
          message.channel.send(embed);
          message.channel.awaitMessages(filter, {
            max: 1,
            time: 30000,
            errors: ['time']
          })
              .then(message => {
                message = message.first()
                if (message.content.toUpperCase() == 'YES' || message.content.toUpperCase() == 'Y') {

                  var accountp = ' - USERNAME = ' + reqUserName + '\n - ID = ' + reqId;
                  //embed
                  const embed = new MessageEmbed()
                      .setAuthor('TwitterFast', client.user.avatarURL(), 'https://github.com/Titouan-Schotte')
                      .setTitle('2/ __Ajout d\'un compte :__')
                      .setColor(0x0066CB)
                      .setDescription('Ajouté avec succés ! \n\nLors du prochain redémarrage vos modifications seront prises en compte !')
                      .addFields(
                          { name: '\u200B', value: '\u200B' },
                          { name: 'Username', value: "@"+reqUserName, inline: true },
                          { name: 'ID', value: reqId, inline: true },
                          { name: 'Catégorie', value: reqCat, inline: true },
                          { name: '\u200B', value: '\u200B' }
                      )
                      .setTimestamp()
                      .setFooter('Bot créé par Titoune#1870')
                  message.channel.send(embed);

                  var content ="\n" + reqUserName + ',' + reqId + ',' + reqCat
                  try {
                    fs.appendFile("accounts.txt",content,function (err) {
                      if (err) throw err;
                      console.log('Saved : ' + reqUserName + " " + reqId);});
                  }
                  catch (err) {
                    console.error(err);
                  }

                } else if (message.content.toUpperCase() == 'NO' || message.content.toUpperCase() == 'N') {
                  CreateEmbed(message.channel, 'Rien n\'a été changé !')
                } else {
                  CreateEmbed(message.channel, 'Réponse Invalide !')
                }
              })
              .catch(collected => {
                CreateEmbed(message.channel, 'Timeout')
              });
        } else {
          message.channel.send('**ATTENTION :** La catégorie entrée doit être "aio", "script", "raffle" ou "twitterfast"')
        }

      } else {
        message.channel.send('**ATTENTION :** L\'ID de du compte que vous souhaitez ajouter doit être un **nombre** contenant **19** caractéres')
      }
    }
  }

});



//Login
client.login(config.DISCORD_TOKEN);