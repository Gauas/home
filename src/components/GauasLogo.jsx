export function GauasLogo({ className = "", light = false }) {
  const source = light ? "/assets/gauas-logo-on-light.png" : "/assets/gauas-logo-on-dark.png";

  return <img className={`gauas-logo ${className}`} src={source} width="2172" height="724" decoding="async" alt="" aria-hidden="true" />;
}
