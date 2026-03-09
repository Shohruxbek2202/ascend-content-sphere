import { Share2, Send, Facebook, Linkedin, Twitter } from 'lucide-react';

interface ShareButtonsProps {
  shareUrl: string;
  title: string;
}

const ShareButtons = ({ shareUrl, title }: ShareButtonsProps) => {
  const shareLinks = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
  };

  const buttons = [
    { href: shareLinks.telegram, icon: Send },
    { href: shareLinks.facebook, icon: Facebook },
    { href: shareLinks.linkedin, icon: Linkedin },
    { href: shareLinks.twitter, icon: Twitter },
  ];

  return (
    <div className="flex items-center gap-2">
      {buttons.map(({ href, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
};

export default ShareButtons;
