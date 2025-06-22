import '@/styles/styles.css';

import Providers from '@/app/providers';
import {
  adelphe,
  inter,
  libreCaslon,
  playfairDisplay,
  poppins,
  satoshi,
} from '@/lib/font';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id'>
      <body
        className={cn(
          playfairDisplay.variable,
          poppins.variable,
          adelphe.variable,
          inter.variable,
          satoshi.variable,
          libreCaslon.variable,
          'scroll-smooth',
          'relative overflow-x-hidden bg-[#0a091e] text-[#e0e0e0]',
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
