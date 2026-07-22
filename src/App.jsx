import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Braces,
  Compass,
  Headphones,
  LayoutTemplate,
  ListChecks,
  Mail,
  Menu,
  MessageCircle,
  PenTool,
  Phone,
  Rocket,
  Search,
  Smartphone,
  X,
} from "lucide-react";

const serviceIcons = [LayoutTemplate, Smartphone, Compass, Headphones];
const processIcons = [Search, ListChecks, PenTool, Braces, Rocket];
const projectImages = ["/assets/project-nomae.png", "/assets/project-arden.png", "/assets/project-ledgerline.png"];
const navTargets = ["services", "work", "process", "about", "insights"];
const brandIcons = {
  facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  zalo: "M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 0 1-.5763-.5729l-.0006.0005a3.273 3.273 0 0 1-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 0 1 1.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 0 1-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 0 1-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z",
};

const content = {
  vi: {
    metaTitle: "GAUAS — Sản phẩm số tạo nên tác động thật",
    metaDescription: "GAUAS thiết kế và phát triển sản phẩm số cho những đội ngũ nhiều tham vọng.",
    homeLabel: "Trang chủ GAUAS",
    primaryNav: "Điều hướng chính",
    mobileNav: "Điều hướng di động",
    footerNav: "Điều hướng chân trang",
    openMenu: "Mở điều hướng",
    closeMenu: "Đóng điều hướng",
    switchLanguage: "Chuyển sang tiếng Anh",
    sectorsLabel: "Các lĩnh vực chúng tôi đồng hành",
    nav: ["Dịch vụ", "Dự án", "Quy trình", "Giới thiệu", "Góc nhìn"],
    getInTouch: "Liên hệ",
    startProject: "Bắt đầu dự án",
    discipline: "Web · Ứng dụng · Chiến lược sản phẩm",
    heroLead: "Sản phẩm số tạo nên",
    heroAccent: "tác động thật.",
    heroLede: "Chúng tôi thiết kế và phát triển website, ứng dụng hữu ích, rồi tiếp tục đồng hành để sản phẩm lớn lên đúng hướng.",
    viewWork: "Xem dự án",
    heroAlt: "Laptop và điện thoại màu graphite hiển thị giao diện số trừu tượng màu xanh",
    proof: "Đồng hành cùng những đội ngũ kiến tạo tương lai",
    sectors: ["TÀI CHÍNH", "BÁN LẺ", "DI CHUYỂN", "SỨC KHỎE", "VĂN HÓA"],
    servicesTitle: "Giải pháp số từ đầu đến cuối.",
    servicesIntro: "Từ định hướng ban đầu đến lúc ra mắt và xa hơn, chúng tôi tạo ra những sản phẩm hữu ích, chỉn chu và sẵn sàng phát triển.",
    exploreServices: "Khám phá dịch vụ",
    learnMore: "Tìm hiểu thêm",
    services: [
      ["Thiết kế Web", "Website thích ứng theo mọi màn hình, kể một câu chuyện rõ ràng và dẫn người dùng tới đúng hành động."],
      ["Phát triển Ứng dụng", "Sản phẩm web và di động tập trung, được xây dựng cho tốc độ, khả năng tiếp cận và tăng trưởng bền vững."],
      ["Chiến lược & Tư vấn", "Định hướng sản phẩm, nghiên cứu và quyết định kỹ thuật được làm rõ trước khi bắt đầu phát triển."],
      ["Chăm sóc & Hỗ trợ", "Bảo trì dài hạn và cải tiến có chủ đích sau khi phiên bản đầu tiên đi vào vận hành."],
    ],
    workTitleA: "Dự án thật.",
    workTitleB: "Kết quả rõ ràng.",
    workIntro: "Một tuyển chọn các dự án sản phẩm, thương hiệu và nền tảng dành cho những đội ngũ nhiều tham vọng.",
    viewProjects: "Xem tất cả dự án",
    projects: [["Nomae", "Định hướng thương mại điện tử"], ["Arden Rooms", "Nhận diện thương hiệu lưu trú"], ["Ledgerline", "Bảng điều khiển sản phẩm"]],
    processTitleA: "Quy trình rõ ràng.",
    processTitleB: "Kết quả khác biệt.",
    process: [
      ["Khám phá", "Chúng tôi lắng nghe mục tiêu thật, người dùng và giới hạn quan trọng nhất."],
      ["Định hình", "Bối cảnh được chuyển thành phạm vi, hệ thống và lộ trình thực tế."],
      ["Thiết kế", "Chúng tôi xây dựng trải nghiệm, thử các tình huống biên và khiến mỗi lựa chọn đều có lý do."],
      ["Phát triển", "Giao diện nhanh, dễ tiếp cận, với nền tảng mà đội ngũ của bạn có thể làm chủ."],
      ["Ra mắt & phát triển", "Chúng tôi đưa sản phẩm vào vận hành, quan sát cách nó được dùng và cải tiến bằng dữ liệu thật."],
    ],
    contactTitle: "Sẵn sàng biến ý tưởng thành sản phẩm?",
    contactCopy: "Hãy kể điều cần thay đổi. Chúng tôi sẽ tìm ra điểm bắt đầu rõ ràng nhất.",
    discussProject: "Trao đổi dự án",
    contactButton: "Liên hệ",
    closeContact: "Đóng liên hệ",
    contactPanelLabel: "Thông tin liên hệ",
    phoneLabel: "Điện thoại",
    emailLabel: "Email",
    facebookLabel: "Facebook",
    telegramLabel: "Telegram",
    zaloLabel: "Zalo",
    footerTagline: "Trải nghiệm số, được tạo nên với chủ đích.",
    footerLinks: ["Dịch vụ", "Dự án", "Quy trình", "Liên hệ"],
  },
  en: {
    metaTitle: "GAUAS — Digital products that create impact",
    metaDescription: "GAUAS designs and builds digital products for ambitious teams.",
    homeLabel: "GAUAS home",
    primaryNav: "Primary navigation",
    mobileNav: "Mobile navigation",
    footerNav: "Footer navigation",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    switchLanguage: "Switch to Vietnamese",
    sectorsLabel: "Sectors we work across",
    nav: ["Services", "Work", "Process", "About", "Insights"],
    getInTouch: "Get in touch",
    startProject: "Start a project",
    discipline: "Web · Apps · Product strategy",
    heroLead: "Digital products that create",
    heroAccent: "real impact.",
    heroLede: "We design and build useful websites and apps, then stay close enough to help the work grow.",
    viewWork: "View our work",
    heroAlt: "Graphite laptop and phone displaying an abstract blue digital interface",
    proof: "Built for teams shaping what’s next",
    sectors: ["FINTECH", "RETAIL", "MOBILITY", "HEALTH", "CULTURE"],
    servicesTitle: "End-to-end digital solutions.",
    servicesIntro: "From early direction to launch and beyond, we make products that feel considered, useful, and ready to evolve.",
    exploreServices: "Explore all services",
    learnMore: "Learn more",
    services: [
      ["Web Design", "Responsive websites shaped around a clear story, a useful path, and measurable business needs."],
      ["App Development", "Focused web and mobile products, engineered for speed, accessibility, and steady growth."],
      ["Strategy & Consulting", "Product direction, research, and technical decisions made concrete before build begins."],
      ["Care & Support", "Long-term maintenance and thoughtful iteration after the first version reaches the world."],
    ],
    workTitleA: "Real projects.",
    workTitleB: "Clear outcomes.",
    workIntro: "A selection of product, brand, and platform work across ambitious teams and changing markets.",
    viewProjects: "View all projects",
    projects: [["Nomae", "E-commerce direction"], ["Arden Rooms", "Hospitality identity"], ["Ledgerline", "Product dashboard"]],
    processTitleA: "A clear process.",
    processTitleB: "Exceptional outcomes.",
    process: [
      ["Discover", "We listen for the real goal, the audience, and the constraint that matters."],
      ["Define", "We turn context into a practical scope, system, and route forward."],
      ["Design", "We compose the experience, test the edges, and make every choice earn its place."],
      ["Develop", "We build fast, accessible interfaces with a foundation your team can own."],
      ["Launch & grow", "We ship, watch the work in use, and improve it with real evidence."],
    ],
    contactTitle: "Ready to bring your idea to life?",
    contactCopy: "Tell us what needs to change. We’ll find the clearest place to begin.",
    discussProject: "Discuss your project",
    contactButton: "Contact us",
    closeContact: "Close contact options",
    contactPanelLabel: "Contact information",
    phoneLabel: "Phone",
    emailLabel: "Email",
    facebookLabel: "Facebook",
    telegramLabel: "Telegram",
    zaloLabel: "Zalo",
    footerTagline: "Digital experiences, composed with purpose.",
    footerLinks: ["Services", "Work", "Process", "Contact"],
  },
};

function detectInitialLanguage() {
  if (typeof window === "undefined") return "vi";
  const stored = window.localStorage.getItem("gauas-language");
  if (stored === "vi" || stored === "en") return stored;
  const detected = (window.navigator.languages?.[0] || window.navigator.language || "").toLowerCase();
  if (detected.startsWith("vi")) return "vi";
  if (detected.startsWith("en")) return "en";
  return "vi";
}

function ArrowLink({ href, children, className = "" }) {
  return (
    <a className={`arrow-link ${className}`} href={href}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={16} strokeWidth={1.7} />
    </a>
  );
}

function BrandIcon({ path }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

function GauasWordmark() {
  return <span className="wordmark__mark" aria-hidden="true" />;
}

function getCarouselVisibleCount() {
  if (typeof window === "undefined") return 1;
  if (window.matchMedia("(min-width: 60rem)").matches) return 3;
  if (window.matchMedia("(min-width: 40rem)").matches) return 2;
  return 1;
}

function ServiceCarousel({ services, learnMore, language }) {
  const labels = language === "vi"
    ? {
        carousel: "Danh sách dịch vụ",
      }
    : {
        carousel: "Services carousel",
      };
  const itemCount = services.length;
  const [position, setPosition] = useState(() => getCarouselVisibleCount() === 3 ? 3 : 2);
  const [visibleCount, setVisibleCount] = useState(getCarouselVisibleCount);
  const [isAnimated, setIsAnimated] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const interactionPaused = hoverPaused || focusPaused || touchPaused;

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 40rem)");
    const desktop = window.matchMedia("(min-width: 60rem)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateViewport = () => {
      setIsAnimated(false);
      setVisibleCount(desktop.matches ? 3 : tablet.matches ? 2 : 1);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIsAnimated(true));
    };
    const updateMotion = () => setReducedMotion(motion.matches);

    tablet.addEventListener("change", updateViewport);
    desktop.addEventListener("change", updateViewport);
    motion.addEventListener("change", updateMotion);
    updateMotion();

    return () => {
      cancelAnimationFrame(frame);
      tablet.removeEventListener("change", updateViewport);
      desktop.removeEventListener("change", updateViewport);
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (interactionPaused || reducedMotion || isTransitioning) return undefined;
    const timer = window.setTimeout(() => {
      setIsAnimated(true);
      setIsTransitioning(true);
      setPosition((current) => current + 1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [interactionPaused, isTransitioning, position, reducedMotion]);

  const activeIndex = ((position - 2) % itemCount + itemCount) % itemCount;
  const leadingCards = visibleCount === 3 ? 1 : 0;
  const firstVisibleTrackIndex = position - leadingCards;
  const shift = -((position - leadingCards) * 100) / visibleCount;
  const trackItems = [
    { ...services[itemCount - 2], originIndex: itemCount - 2, key: "before-2" },
    { ...services[itemCount - 1], originIndex: itemCount - 1, key: "before-1" },
    ...services.map((service, originIndex) => ({ ...service, originIndex, key: `service-${originIndex}` })),
    { ...services[0], originIndex: 0, key: "after-1" },
    { ...services[1], originIndex: 1, key: "after-2" },
  ];

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    let resetPosition = null;
    if (position === 1) resetPosition = itemCount + 1;
    if (position === itemCount + 2) resetPosition = 2;

    if (resetPosition !== null) {
      setIsAnimated(false);
      setPosition(resetPosition);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsAnimated(true)));
    }
    setIsTransitioning(false);
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusPaused(false);
  };

  return (
    <div
      className="service-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHoverPaused(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHoverPaused(false);
      }}
      onTouchStart={() => setTouchPaused(true)}
      onTouchEnd={() => setTouchPaused(false)}
      onTouchCancel={() => setTouchPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="service-carousel__viewport">
        <div
          className="service-carousel__track"
          data-animated={isAnimated && !reducedMotion}
          onTransitionEnd={handleTransitionEnd}
          style={{
            "--carousel-visible": visibleCount,
            "--carousel-shift": `${shift}%`,
          }}
        >
          {trackItems.map(({ icon: Icon, number, title, copy: description, originIndex, key }, trackIndex) => {
            const isVisible = trackIndex >= firstVisibleTrackIndex && trackIndex < firstVisibleTrackIndex + visibleCount;
            const isActive = originIndex === activeIndex;
            return (
              <div
                className="service-carousel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${originIndex + 1} / ${itemCount}`}
                aria-hidden={!isVisible}
                key={key}
              >
                <a className={`service-card ${isActive ? "is-active" : ""}`} href="#contact" tabIndex={isVisible ? 0 : -1}>
                  <span className="service-card__number" aria-hidden="true">{number}</span>
                  <header className="service-card__head">
                    <div className="service-card__icon" aria-hidden="true"><Icon size={21} strokeWidth={1.6} /></div>
                    <h3>{title}</h3>
                  </header>
                  <p>{description}</p>
                  <div className="service-card__action">
                    <span>{learnMore}</span>
                    <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState(detectInitialLanguage);
  const contactWidgetRef = useRef(null);
  const contactTriggerRef = useRef(null);
  const copy = content[language];
  const services = copy.services.map(([title, description], index) => ({
    icon: serviceIcons[index],
    number: String(index + 1).padStart(2, "0"),
    title,
    copy: description,
  }));
  const projects = copy.projects.map(([title, type], index) => ({ image: projectImages[index], title, type }));
  const process = copy.process.map(([title, description], index) => ({ icon: processIcons[index], number: String(index + 1).padStart(2, "0"), title, copy: description }));

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.metaTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.metaDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.metaTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.metaDescription);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", language === "vi" ? "vi_VN" : "en_US");
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${window.location.origin}${window.location.pathname}`);
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", `${window.location.origin}/assets/hero-devices.png`);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", copy.metaTitle);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", copy.metaDescription);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", `${window.location.origin}/assets/hero-devices.png`);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${window.location.pathname}`);
    const structuredData = document.querySelector("#structured-data");
    if (structuredData) {
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "GAUAS",
        url: `${window.location.origin}${window.location.pathname}`,
        image: `${window.location.origin}/assets/hero-devices.png`,
        description: copy.metaDescription,
        email: "tnqb.job106204@gmail.com",
        telephone: "+84367641617",
        sameAs: ["https://www.facebook.com/tranng.qubao/"],
      });
    }
    window.localStorage.setItem("gauas-language", language);
  }, [copy.metaDescription, copy.metaTitle, language]);

  useEffect(() => {
    let frame = 0;
    const updateNav = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateNav);
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8%" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!contactOpen) return undefined;

    contactWidgetRef.current?.querySelector("a")?.focus({ preventScroll: true });
    const closeContactPanel = (event) => {
      if (event.key === "Escape") {
        setContactOpen(false);
        contactTriggerRef.current?.focus({ preventScroll: true });
      }
      if (event.type === "pointerdown" && !contactWidgetRef.current?.contains(event.target)) {
        setContactOpen(false);
      }
    };

    document.addEventListener("keydown", closeContactPanel);
    document.addEventListener("pointerdown", closeContactPanel);
    return () => {
      document.removeEventListener("keydown", closeContactPanel);
      document.removeEventListener("pointerdown", closeContactPanel);
    };
  }, [contactOpen]);

  return (
    <>
      <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-nav__inner">
          <a className="wordmark" href="#top" aria-label={copy.homeLabel}><GauasWordmark /></a>
          <nav className="site-nav__links" aria-label={copy.primaryNav}>
            {copy.nav.map((item, index) => (
              <a key={navTargets[index]} href={`#${navTargets[index]}`}>{item}</a>
            ))}
          </nav>
          <div className="site-nav__actions">
            <button className="language-switch" type="button" onClick={() => setLanguage(language === "vi" ? "en" : "vi")} aria-label={copy.switchLanguage}>
              {language === "vi" ? "EN" : "VI"}
            </button>
            <a className="nav-cta" href="#contact">{copy.getInTouch} <ArrowRight aria-hidden="true" size={14} /></a>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? copy.closeMenu : copy.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        <nav id="mobile-menu" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-label={copy.mobileNav}>
          {copy.nav.map((item, index) => (
            <a key={navTargets[index]} href={`#${navTargets[index]}`} onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
          <div className="mobile-menu__actions">
            <button className="language-switch" type="button" onClick={() => setLanguage(language === "vi" ? "en" : "vi")} aria-label={copy.switchLanguage}>
              {language === "vi" ? "English" : "Tiếng Việt"}
            </button>
            <a className="mobile-menu__cta" href="#contact" onClick={() => setMenuOpen(false)}>{copy.startProject}</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero" id="top">
          <img
            className="hero__image"
            src="/assets/hero-devices.png"
            alt={copy.heroAlt}
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <div className="hero__shade" aria-hidden="true" />
          <div className="shell hero__inner">
            <div className="hero__copy">
              <p className="hero__discipline">{copy.discipline}</p>
              <h1>{copy.heroLead} <span>{copy.heroAccent}</span></h1>
              <p className="hero__lede">{copy.heroLede}</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#contact">{copy.startProject} <ArrowRight aria-hidden="true" size={16} /></a>
                <a className="button button--quiet" href="#work">{copy.viewWork}</a>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-labelledby="sector-title">
          <div className="shell proof-strip__inner">
            <header className="proof-strip__head">
              <p>{copy.sectorsLabel}</p>
              <h2 id="sector-title">{copy.proof}</h2>
            </header>
            <ul>
              {copy.sectors.map((sector) => <li key={sector}>{sector}</li>)}
            </ul>
          </div>
        </section>

        <div className="light-stage">
          <section className="services-stage" id="services">
            <div className="services shell" data-reveal>
              <header className="section-intro">
                <h2>{copy.servicesTitle}</h2>
                <p>{copy.servicesIntro}</p>
                <ArrowLink href="#contact">{copy.exploreServices}</ArrowLink>
              </header>
              <ServiceCarousel services={services} learnMore={copy.learnMore} language={language} />
            </div>
          </section>

          <section className="work shell" id="work" data-reveal>
            <header className="section-intro">
              <h2>{copy.workTitleA}<br />{copy.workTitleB}</h2>
              <p>{copy.workIntro}</p>
              <ArrowLink href="#work">{copy.viewProjects}</ArrowLink>
            </header>
            <div className="project-grid">
              {projects.map((project) => (
                <a className="project-card" href="#contact" key={project.title}>
                  <figure>
                    <img src={project.image} alt="" width="1024" height="768" loading="lazy" decoding="async" />
                  </figure>
                  <div className="project-card__meta">
                    <span><strong>{project.title}</strong><small>{project.type}</small></span>
                    <ArrowRight aria-hidden="true" size={18} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        <section className="process" id="process">
          <div className="shell process__layout" id="about" data-reveal>
            <header className="process__intro">
              <h2>{copy.processTitleA} <span>{copy.processTitleB}</span></h2>
            </header>
            <div className="process__journey">
              <div className="process__canvas">
                <div className="process__rail" aria-hidden="true" />
                <ol className="process__steps">
                  {process.map(({ icon: Icon, number, title, copy }, index) => (
                    <li style={{ "--step-delay": `${260 + index * 70}ms` }} key={number}>
                      <div className="process__step-head">
                        <div className="process__icon" aria-hidden="true"><Icon size={27} strokeWidth={1.45} /></div>
                      </div>
                      <span className="process__stem" aria-hidden="true"><i /></span>
                      <div className="process__content">
                        <span className="process__number">{number}</span>
                        <h3>{title}</h3>
                        <p>{copy}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <aside className="contact-card shell" id="contact" data-reveal>
            <div>
              <h2>{copy.contactTitle}</h2>
              <p>{copy.contactCopy}</p>
            </div>
            <a className="button button--primary" href="mailto:tnqb.job106204@gmail.com">{copy.discussProject} <ArrowRight aria-hidden="true" size={16} /></a>
            <div className="contact-card__art" aria-hidden="true"><i /><i /><i /></div>
          </aside>
        </section>
      </main>

      <footer className="site-footer" id="insights">
        <div className="shell site-footer__inner">
          <a className="wordmark" href="#top" aria-label={copy.homeLabel}><GauasWordmark /></a>
          <p>{copy.footerTagline}</p>
          <nav aria-label={copy.footerNav}>
            <a href="#services">{copy.footerLinks[0]}</a><a href="#work">{copy.footerLinks[1]}</a><a href="#process">{copy.footerLinks[2]}</a><a href="#contact">{copy.footerLinks[3]}</a>
          </nav>
          <p className="site-footer__credit">© 2026 GAUAS</p>
        </div>
      </footer>

      <div className={`contact-widget ${contactOpen ? "is-open" : ""}`} ref={contactWidgetRef}>
        <aside className="contact-panel" id="contact-panel" aria-label={copy.contactPanelLabel} aria-hidden={!contactOpen} inert={contactOpen ? undefined : ""}>
          <ul>
            <li>
              <a className="contact-bubble contact-bubble--phone" href="tel:+84367641617" aria-label={`${copy.phoneLabel}: +84 367 641 617`}>
                <Phone aria-hidden="true" size={21} />
              </a>
            </li>
            <li>
              <a className="contact-bubble contact-bubble--email" href="mailto:tnqb.job106204@gmail.com" aria-label={`${copy.emailLabel}: tnqb.job106204@gmail.com`}>
                <Mail aria-hidden="true" size={21} />
              </a>
            </li>
            <li>
              <a className="contact-bubble contact-bubble--facebook" href="https://www.facebook.com/tranng.qubao/" target="_blank" rel="noreferrer" aria-label={`${copy.facebookLabel}: tranng.qubao`}>
                <BrandIcon path={brandIcons.facebook} />
              </a>
            </li>
            <li>
              <a className="contact-bubble contact-bubble--telegram" href="https://t.me/tnqb_bao" target="_blank" rel="noreferrer" aria-label={`${copy.telegramLabel}: tnqb_bao`}>
                <BrandIcon path={brandIcons.telegram} />
              </a>
            </li>
            <li>
              <a className="contact-bubble contact-bubble--zalo" href="https://zalo.me/0367641617" target="_blank" rel="noreferrer" aria-label={`${copy.zaloLabel}: 0367641617`}>
                <BrandIcon path={brandIcons.zalo} />
              </a>
            </li>
          </ul>
        </aside>
        <button
          className="contact-trigger"
          ref={contactTriggerRef}
          type="button"
          aria-label={contactOpen ? copy.closeContact : copy.contactButton}
          aria-expanded={contactOpen}
          aria-controls="contact-panel"
          onClick={() => setContactOpen((open) => !open)}
        >
          {contactOpen ? (
            <X aria-hidden="true" size={22} />
          ) : (
            <><MessageCircle aria-hidden="true" size={19} /><span>{copy.contactButton}</span></>
          )}
        </button>
      </div>
    </>
  );
}

export default App;
