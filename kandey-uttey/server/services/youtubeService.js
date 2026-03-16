const { YoutubeTranscript } = require('youtube-transcript');

const getLyrics = async (url) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to fetch lyrics from YouTube.');
  }
};

module.exports = { getLyrics };