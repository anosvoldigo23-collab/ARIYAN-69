const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "song"],
    version: "0.0.2",
    author: "Christus x Aesther",
    countDown: 5,
    role: 0,
    category: "MUSIC",
    shortDescription: "🎵 Recherche et joue une chanson depuis YouTube",
    longDescription: "Recherche et télécharge une musique depuis YouTube et l'envoie dans le chat.",
    guide: "{pn} <nom de la chanson ou URL YouTube>",
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ api, event, args }) {
    if (!args.length) return api.sendMessage("❌ Veuillez fournir un nom de chanson ou une URL YouTube.", event.threadID, event.messageID);

    const query = args.join(" ");
    const waitMsg = await api.sendMessage("🎵 Recherche et téléchargement en cours...", event.threadID, null, event.messageID);

    try {
      let videoUrl;

      if (query.startsWith("http")) {
        videoUrl = query;
      } else {
        const searchResult = await ytSearch(query);
        if (!searchResult || !searchResult.videos.length) throw new Error("Aucun résultat trouvé.");
        videoUrl = searchResult.videos[0].url;
      }

      const apiUrl = `http://65.109.80.126:20409/aryan/play?url=${encodeURIComponent(videoUrl)}`;
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data.status || !data.downloadUrl) throw new Error("L'API n'a pas renvoyé d'URL de téléchargement.");

      const fileName = `${data.title}.mp3`.replace(/[\\/:"*?<>|]/g, "");
      const filePath = path.join(__dirname, fileName);

      const audioRes = await axios.get(data.downloadUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, audioRes.data);

      await api.sendMessage(
        {
          body: `┌─🎶 𝐌𝐔𝐒𝐈𝐐𝐔𝐄 ─────────────┐\nTitre : ${data.title}\n└─────────────────────┘`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(filePath);
          api.unsendMessage(waitMsg.messageID);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(`❌ Échec du téléchargement de la chanson: ${err.message}`, event.threadID, event.messageID);
      api.unsendMessage(waitMsg.messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
