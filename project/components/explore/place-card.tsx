const handleShare = async () => {
  try {
    const shareUrl = `${window.location.origin}/explore?place=${place.placeId}`;
    
    if (navigator.share) {
      await navigator.share({
        title: place.name,
        text: `Check out ${place.name} on our travel platform!`,
        url: shareUrl
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    toast.error('Failed to share place');
  }
}; 