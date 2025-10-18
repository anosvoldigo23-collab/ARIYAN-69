const axios = require("axios");
const g = require("fca-aryan-nix"); // GoatWrapper pour noprefix

module.exports = {
  config: {
    name: "imgbb",
    version: "1.0.0",
    author: "Christus x Merdi",
    countDown: 0,
    role: 0,
    category: "utilitaire",
    usePrefix: false, // Désactive le préfixe
    noPrefix: true,   // Activation noprefix
    shortDescription: "Téléverse une image/vidéo sur ImgBB",
    longDescription: "Réponds à une image ou fournis une URL pour la téléverser sur ImgBB.",
    guide: "{pn} Répond à une image ou fournis une URL"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    let mediaUrl = "";

    if (messageReply && messageReply.attachments.length > 0) {
      mediaUrl = messageReply.attachments[0].url;
    } else if (args.length > 0) {
      mediaUrl = args.join(" ");
    }

    if (!mediaUrl) {
      return api.sendMessage("❌ Veuillez répondre à une image ou fournir une URL !", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(`http://65.109.80.126:20409/aryan/imgbb?url=${encodeURIComponent(mediaUrl)}`);
      const imgbbLink = res.data.link;

      if (!imgbbLink) {
        api.setMessageReaction("", messageID, () => {}, true);
        return api.sendMessage("❌ Échec du téléversement sur ImgBB.", threadID, messageID);
      }

      const msg = `
╔═════════════════════════════
║ ✨ 𝐈𝐌𝐆𝐁𝐁 𝐔𝐏𝐋𝐎𝐀𝐃 ✨
╠═════════════════════════════
║ 📤 Lien de l'image/vidéo :
║ ${imgbbLink}
╚═════════════════════════════
      `.trim();

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      console.error("Erreur de téléversement ImgBB:", err);
      api.setMessageReaction("", messageID, () => {}, true);
      return api.sendMessage("⚠ Une erreur s'est produite lors du téléversement.", threadID, messageID);
    }
  }
};

// Activation noprefix via GoatWrapper
const wrapper = new g.GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: false });
