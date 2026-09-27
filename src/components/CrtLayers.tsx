/**
 * Decorative only. Three stacked non-interactive layers; see DESIGN.md for the
 * photosensitivity constraint (nothing here flashes faster than 3Hz).
 */
export function CrtLayers() {
  return (
    <>
      <div className="crt-layer crt-scanlines" aria-hidden="true" />
      <div className="crt-layer crt-vignette" aria-hidden="true" />
      <div className="crt-layer crt-flicker" aria-hidden="true" />
    </>
  );
}
