import React from 'react';
import Cobweb from './Cobweb';
import FloatingGhost from './FloatingGhost';
import FloatingBat from './FloatingBat';

const HalloweenDecorations: React.FC = () => {
  return (
    <>
      {/* Cobwebs in corners - MORE COBWEBS! */}
      <Cobweb position="top-left" size="large" />
      <Cobweb position="top-right" size="large" />
      <Cobweb position="bottom-left" size="medium" />
      <Cobweb position="bottom-right" size="large" />

      {/* Floating ghosts - subtle and creepy */}
      <FloatingGhost delay={0} duration={6} left="10%" />
      <FloatingGhost delay={2} duration={7} left="30%" />
      <FloatingGhost delay={4} duration={5} left="70%" />
      <FloatingGhost delay={1} duration={6.5} left="85%" />
      <FloatingGhost delay={3.5} duration={6} left="50%" />

      {/* Floating bats - MORE BATS! */}
      <FloatingBat delay={0.5} duration={5} right="20%" />
      <FloatingBat delay={3} duration={6} right="50%" />
      <FloatingBat delay={5} duration={5.5} right="80%" />
      <FloatingBat delay={1.5} duration={5} right="10%" />
      <FloatingBat delay={4} duration={6.5} right="65%" />
      <FloatingBat delay={2} duration={5.5} right="35%" />
    </>
  );
};

export default HalloweenDecorations;
