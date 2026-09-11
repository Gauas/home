export function GauasLogo({ className = "", light = false }) {
  const source = light ? "/assets/full_logo_light.png" : "/assets/full_logo.png";

  return <img className={`gauas-logo ${className}`} src={source} alt="" aria-hidden="true" />;
}
