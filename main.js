const Discord = require("discord.js");
const rand_words = require("random-words");
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.login(token);

async function hangman(message, args) {
    const word = rand_words();

    //array with images of hangman
    const hangman_imgs = [
        "https://cdn.discordapp.com/attachments/858772720259301396/858825264967974952/hangman0.png", 
        "https://cdn.discordapp.com/attachments/858772720259301396/858825259150606376/hangman1.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825257430941756/hangman2.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825256302805012/hangman3.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825254548668416/hangman4.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825252405903370/hangman5.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825250602221568/hangman6.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825249109442580/hangman7.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825247876710410/hangman8.png",
        "https://cdn.discordapp.com/attachments/858772720259301396/858825245870915594/hangman9.png"
    ]
    
    await message.channel.send("The word is " + word);

    //creates a solo variable and sets it to true if the solo argument is used
    var solo = false
    if (args[0] && args[0].toLowerCase() === "solo") solo = true

    console.log(solo)

    var embed_letters = "";

    // Fill embed with _ for the letters
    for (var i = 0; i < word.length; ++i) {
        embed_letters += '_';
    }

    // Create an embed to start
    var hangman_embed = new Discord.MessageEmbed()
                          .setTitle(`A game of Hangman${solo ? " (solo mode)" : ''}`)
                          .setFooter(embed_letters)
                          .setImage(hangman_imgs[0]); //sets the hangman image

    var hangman_msg = await message.channel.send(hangman_embed);

    const correct_letters = [];
    const incorrect_letters = [];

    var word_found = false;
    var guessed_letter;

    while (!word_found)  {

        // Wait for the next message from the person who started the game and get its first letter as the guess
        await message.channel.awaitMessages(m => solo ? m.author.id === message.author.id : true,
            { max: 1 })
            .then(collected => {
                guessed_letter = collected.first().content.substr(0, 1).toLowerCase();
            });

        if (correct_letters.includes(guessed_letter) || incorrect_letters.includes(guessed_letter)) {
            await message.channel.send("Letter already guessed");
            continue;
        }

        // Push letters to the arrays as we go

        // If the guessed letter was correct
        if (word.includes(guessed_letter)) {
            if (!correct_letters.includes(guessed_letter)) {
                correct_letters.push(guessed_letter);
            }
        } else {
            incorrect_letters.push(guessed_letter);
        }

        
        // Edit embed letters to add to the footer, if not found replace with _
        embed_letters = word.split("")
                        .map(char => correct_letters
                                    .includes(char) ? char : "_")
                        .join("");

        // Edit embed with new letters
        const edit_embed = new Discord.MessageEmbed()
                            .setTitle(`A game of Hangman${solo ? " (solo mode)" : ''}`)
                            .setDescription(incorrect_letters.join(", "))
                            .setFooter(embed_letters)
                            .setImage(hangman_imgs[incorrect_letters.length]); //sets the hangman image

        await hangman_msg.edit(edit_embed);

        if (embed_letters === word) {
            word_found = true;
            await message.channel.send("Congratulations! You win!");
        }
        
        //ends the game and the player loses if the hangman is completely drawn
        if (incorrect_letters.length >= 9) {
            word_found = true;
            await message.channel.send("Congratulations! You lose!");      
        }

    }
}

client.on("message", (message) => {

    // Do nothing if this isn't a command and if it was sent by a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length)
                 .trim()
                 .split(/ +/);

    const command = args.shift().toLowerCase();

    if(command === "hangman") {
        hangman(message, args);
    }
})
