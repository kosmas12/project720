const Discord = require("discord.js");
const rand_words = require("random-words");
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.login(token);

async function hangman(message) {
    const word = rand_words();

    await message.channel.send("The word is " + word);

    var embed_letters = "";

    // Fill embed with _ for the letters
    for (var i = 0; i < word.length; ++i) {
        embed_letters += '_';
    }

    // Create an embed to start
    var hangman_embed = new Discord.MessageEmbed()
                          .setTitle('A game of Hangman')
                          .setFooter(embed_letters);

    var hangman_msg = await message.channel.send(hangman_embed);

    const lettersCorrect = [];
    const lettersIncorrect = [];

    var word_found = false;
    var guessed_letter;

    while (!word_found)  {

        // Wait for the next message from the person who started the game and get its first letter as the guess
        await message.channel.awaitMessages(m => m.author.id === message.author.id,
            { max: 1 })
            .then(collected => {
                guessed_letter = collected.first().content.substr(0, 1).toLowerCase();
            });

        if (lettersCorrect.includes(guessed_letter) || lettersIncorrect.includes(guessed_letter)) {
            await message.channel.send("Letter already guessed");
            continue;
        }

        // Push letters to the arrays as we go

        // If the guessed letter was correct
        if (word.includes(guessed_letter)) {
            if (!lettersCorrect.includes(guessed_letter)) {
                lettersCorrect.push(guessed_letter);

                // Edit embed letters to add to the footer, if not found replace with _
                embed_letters = word.split("")
                                .map(char => lettersCorrect
                                            .includes(char) ? char : "_")
                                .join("");

                // Edit embed with new letters
                const edit_embed = new Discord.MessageEmbed()
                                   .setTitle('A game of Hangman')
                                   .setFooter(embed_letters);

                await hangman_msg.edit(edit_embed);
            }
        } else {
            lettersIncorrect.push(guessed_letter);
        }

        if (embed_letters === word) {
            word_found = true;
            await message.channel.send("Congratulations! You win!");
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
        hangman(message);
    }
})
