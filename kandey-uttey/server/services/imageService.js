const getImageUrl = (concept) => {
  // Using the Unsplash Source API as requested for simplified fetching
  const formattedConcept = encodeURIComponent(concept);
  return `https://source.unsplash.com/featured/?${formattedConcept}`;
};

module.exports = { getImageUrl };