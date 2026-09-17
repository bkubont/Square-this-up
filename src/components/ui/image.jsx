import { forwardRef } from 'react';
export const Image = forwardRef(/** @param {import('react').ComponentPropsWithoutRef<'img'> & { fittingType?: string }} props
 * @param {import("react").ForwardedRef<HTMLImageElement>} ref */ function Image({ src, fittingType = 'fill', style, ...props }, ref) {
  return <img ref={ref} src={src || undefined} loading="lazy" style={{ objectFit: fittingType === 'fill' ? 'cover' : 'contain', ...style }} {...props} />;
});
