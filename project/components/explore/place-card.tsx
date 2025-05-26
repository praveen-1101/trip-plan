import { Attraction } from "@/types/attractions";
import { toast } from "sonner";

const handleShare = async (place: Attraction) => {
  try {
    const shareUrl = `${window.location.origin}/explore?place=${place.id}`;
    
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