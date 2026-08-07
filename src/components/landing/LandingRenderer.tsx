import type { LandingConfig } from '@/lib/landing';
import { AuroraTemplate } from './templates/AuroraTemplate';
import { BoldTemplate } from './templates/BoldTemplate';
import { SplitTemplate } from './templates/SplitTemplate';
import { NeonTemplate } from './templates/NeonTemplate';
import { CleanTemplate } from './templates/CleanTemplate';

interface Props {
  template: string;
  config: LandingConfig;
  landingId?: string;
  slug?: string;
}

export const LandingRenderer = ({ template, config, landingId, slug }: Props) => {
  const props = { config, landingId, slug };
  switch (template) {
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'split':
      return <SplitTemplate {...props} />;
    case 'neon':
      return <NeonTemplate {...props} />;
    case 'clean':
      return <CleanTemplate {...props} />;
    default:
      return <AuroraTemplate {...props} />;
  }
};
