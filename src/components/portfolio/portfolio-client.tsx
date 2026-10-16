"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { coreSystems, flowSteps, journey, navItems, portfolioProjects, techRows } from "./data";
import { JourneyGlobe } from "./journey-globe";
import { TradingChart } from "./trading-chart";

const email = "amandwivedi1357@gmail.com";

function repeated<T>(items: readonly T[]) {
  return [...items, ...items];
}

export function PortfolioClient() {
  const [copied, setCopied] = useState(false);
  const [activeJourney, setActiveJourney] = useState(0);
  const [tick, setTick] = useState({ bid: "1.08414", ask: "1.08417", spread: "0.3" });

  useEffect(() => {
    let mid = 1.08415;
    const timer = window.setInterval(() => {
      mid += (Math.random() - 0.5) * 0.00006;
      const spread = 0.00002 + Math.random() * 0.00004;
      setTick({
        bid: (mid - spread / 2).toFixed(5),
        ask: (mid + spread / 2).toFixed(5),
        spread: (spread * 10000).toFixed(1),
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const preloader = document.querySelector<HTMLElement>(".pre");

    if (reducedMotion) {
      preloader?.remove();
      return;
    }

    let cleanups: Array<() => void> = [];

    const run = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);

      const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
        document.querySelector<T>(selector);
      const $$ = <T extends HTMLElement = HTMLElement>(selector: string) =>
        Array.from(document.querySelectorAll<T>(selector));

      root.classList.add("js");
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", ScrollTrigger.update);
      const ticker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
      root.style.overflow = "hidden";

      cleanups.push(() => {
        gsap.ticker.remove(ticker);
        lenis.destroy();
        root.classList.remove("js");
        root.style.overflow = "";
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        gsap.globalTimeline.clear();
      });

      $$<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
        const handleClick = (event: MouseEvent) => {
          const href = link.getAttribute("href");
          if (!href) return;
          const target = document.querySelector<HTMLElement>(href);
          if (!target) return;
          event.preventDefault();
          if (href === "#contact") {
            lenis.scrollTo(document.body.scrollHeight);
          } else {
            lenis.scrollTo(target);
          }
        };

        link.addEventListener("click", handleClick);
        cleanups.push(() => link.removeEventListener("click", handleClick));
      });

      const split = (element: HTMLElement) => {
        const text = element.textContent ?? "";
        element.setAttribute("aria-label", text);
        element.innerHTML = text
          .split(" ")
          .map(
            (word) =>
              `<span class="w" aria-hidden="true">${word
                .split("")
                .map((char) => `<i class="c">${char}</i>`)
                .join("")}</span>`,
          )
          .join(" ");
        return Array.from(element.querySelectorAll<HTMLElement>(".c"));
      };

      const glyphs = "!<>-_/[]{}=+*^?#01";
      const scramble = (element: HTMLElement, duration = 1) => {
        const target = element.dataset.t ?? element.textContent ?? "";
        const progress = { value: 0 };
        gsap.to(progress, {
          value: 1,
          duration,
          ease: "none",
          onUpdate: () => {
            element.textContent = target
              .split("")
              .map((char, index) =>
                char === " " || index < progress.value * target.length
                  ? char
                  : glyphs[Math.floor(Math.random() * glyphs.length)],
              )
              .join("");
          },
          onComplete: () => {
            element.textContent = target;
          },
        });
      };

      $$(".scr").forEach((element) => {
        const inContact = element.closest("#contact");
        ScrollTrigger.create({
          trigger: inContact ? ".main" : element,
          start: inContact ? "bottom 85%" : "top 92%",
          once: true,
          onEnter: () => scramble(element, 0.9),
        });
      });

      $$("[data-split]").forEach((heading) => {
        const chars = split(heading);
        gsap.from(chars, {
          yPercent: 110,
          rotate: 8,
          opacity: 0,
          filter: "blur(8px)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.025,
          scrollTrigger: { trigger: heading, start: "top 85%" },
        });
      });

      const flipWords = $$(".flip span");
      let currentWord = 0;
      gsap.set(flipWords.slice(1), { yPercent: 110, opacity: 0 });

      const flip = () => {
        const next = (currentWord + 1) % flipWords.length;
        gsap.to(flipWords[currentWord], {
          yPercent: -110,
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.6,
          ease: "power3.in",
        });
        gsap.fromTo(
          flipWords[next],
          { yPercent: 110, opacity: 0, filter: "blur(6px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            delay: 0.35,
          },
        );
        currentWord = next;
      };

      const heroChars = $$(".sp")
        .map((element) => split(element))
        .flat();
      const counter = { value: 0 };
      const flipTimer = window.setInterval(flip, 2300);
      cleanups.push(() => window.clearInterval(flipTimer));

      const timeline = gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          preloader?.remove();
          root.style.overflow = "";
          lenis.start();
        },
      });

      timeline
        .to(counter, {
          value: 100,
          duration: 1.7,
          ease: "power2.inOut",
          onUpdate: () => {
            const percent = $("#pn");
            if (percent) percent.textContent = Math.round(counter.value).toString();
          },
        })
        .to(".pc", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" })
        .to(".pl.l", { xPercent: -100, duration: 1.1, ease: "power4.inOut" }, "open")
        .to(".pl.r", { xPercent: 100, duration: 1.1, ease: "power4.inOut" }, "open")
        .from(
          heroChars,
          {
            yPercent: 120,
            rotate: 10,
            opacity: 0,
            filter: "blur(10px)",
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.035,
          },
          "open+=.55",
        )
        .from(".flip", { opacity: 0, duration: 0.6 }, "open+=.9")
        .from(".fade", { y: 26, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, "open+=1");

      const hero = $("#hero");
      const spot = $(".spot");
      const canvas = $<HTMLCanvasElement>("#pt");

      if (hero && spot) {
        const handleHeroPointer = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          spot.style.setProperty("--sx", `${event.clientX - rect.left}px`);
          spot.style.setProperty("--sy", `${event.clientY - rect.top}px`);
        };
        hero.addEventListener("pointermove", handleHeroPointer);
        cleanups.push(() => hero.removeEventListener("pointermove", handleHeroPointer));
      }

      gsap.to(".hin", {
        yPercent: -20,
        opacity: 0.1,
        ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".aur", {
        yPercent: 25,
        ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".tick", {
        y: -140,
        ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
      });

      if (hero && canvas) {
        const context = canvas.getContext("2d");
        const color =
          getComputedStyle(document.documentElement).getPropertyValue("--ac").trim() || "#3DDC97";
        let width = 0;
        let height = 0;
        let pointerX = -999;
        let pointerY = -999;
        let visible = true;
        let frame = 0;
        let particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];

        const resize = () => {
          width = canvas.width = hero.offsetWidth;
          height = canvas.height = hero.offsetHeight;
          particles = Array.from({ length: Math.min(80, Math.floor(width / 16)) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
          }));
        };

        const handlePointer = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          pointerX = event.clientX - rect.left;
          pointerY = event.clientY - rect.top;
        };

        const observer = new IntersectionObserver((entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        });

        const paint = () => {
          frame = window.requestAnimationFrame(paint);
          if (!visible || !context) return;
          context.clearRect(0, 0, width, height);
          context.fillStyle = color;
          context.strokeStyle = color;

          for (let index = 0; index < particles.length; index += 1) {
            const particle = particles[index];
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;

            context.globalAlpha = 0.6;
            context.fillRect(particle.x, particle.y, 2, 2);

            for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
              const next = particles[nextIndex];
              const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
              if (distance < 100) {
                context.globalAlpha = 0.16 * (1 - distance / 100);
                context.beginPath();
                context.moveTo(particle.x, particle.y);
                context.lineTo(next.x, next.y);
                context.stroke();
              }
            }

            const pointerDistance = Math.hypot(particle.x - pointerX, particle.y - pointerY);
            if (pointerDistance < 160) {
              context.globalAlpha = 0.5 * (1 - pointerDistance / 160);
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(pointerX, pointerY);
              context.stroke();
              particle.x += (particle.x - pointerX) * 0.004;
              particle.y += (particle.y - pointerY) * 0.004;
            }
          }
        };

        resize();
        paint();
        window.addEventListener("resize", resize);
        hero.addEventListener("pointermove", handlePointer);
        observer.observe(hero);
        cleanups.push(() => {
          window.cancelAnimationFrame(frame);
          window.removeEventListener("resize", resize);
          hero.removeEventListener("pointermove", handlePointer);
          observer.disconnect();
        });
      }

      const scrub = $(".scrub");
      if (scrub) {
        scrub.innerHTML = (scrub.textContent ?? "")
          .split(" ")
          .map((word) => `<span>${word}</span>`)
          .join(" ");
      }

      gsap.fromTo(
        ".scrub span",
        { opacity: 0.12, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: ".scrub", start: "top 82%", end: "bottom 50%", scrub: true },
        },
      );

      $$("[data-n]").forEach((element) => {
        const value = Number.parseFloat(element.dataset.n ?? "0");
        const decimals = value % 1 ? 1 : 0;
        const counterValue = { value: 0 };
        gsap.to(counterValue, {
          value,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
          onUpdate: () => {
            element.textContent = counterValue.value.toFixed(decimals);
          },
        });
      });

      $$(".rv").forEach((element) => {
        gsap.from(element, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 90%" },
        });
      });

      gsap.to(".drift", {
        x: () => -(window.innerWidth * 0.5),
        ease: "none",
        scrollTrigger: { trigger: ".drift", start: "top bottom", end: "bottom top", scrub: true },
      });

      ScrollTrigger.create({
        onUpdate: (self) => {
          gsap.to(".row span", {
            skewX: gsap.utils.clamp(-10, 10, self.getVelocity() / -260),
            duration: 0.4,
            overwrite: "auto",
          });
        },
      });

      const media = gsap.matchMedia();
      media.add("(min-width:900px)", () => {
        const track = $(".track");
        if (!track) return;
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: "#work",
            pin: true,
            scrub: 0.7,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
      });

      media.add("(max-width:899px)", () => {
        $$(".card").forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 0.9,
            scrollTrigger: { trigger: card, start: "top 90%" },
          });
        });
      });

      const finePointer = window.matchMedia("(pointer:fine)").matches;
      if (finePointer) {
        $$(".card").forEach((card) => {
          const handlePointer = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, {
              rotationY: x * 12,
              rotationX: -y * 12,
              transformPerspective: 900,
              duration: 0.4,
              ease: "power2.out",
            });
          };
          const reset = () => {
            gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: "elastic.out(1,.5)" });
          };
          card.addEventListener("pointermove", handlePointer);
          card.addEventListener("pointerleave", reset);
          cleanups.push(() => {
            card.removeEventListener("pointermove", handlePointer);
            card.removeEventListener("pointerleave", reset);
          });
        });
      }

      const beam = $(".beam");
      gsap.to(".fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".flow",
          start: "top 60%",
          end: "bottom 60%",
          scrub: true,
          onUpdate: (self) => {
            if (!beam) return;
            beam.style.top = `calc(${self.progress * 100}% - 7px)`;
            beam.style.opacity = self.progress > 0 && self.progress < 1 ? "1" : "0";
          },
        },
      });

      $$(".st").forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          onEnter: () => step.classList.add("on"),
          onLeaveBack: () => step.classList.remove("on"),
        });
      });

      const journeyStops = $$(".journey-stop");
      const journeyDots = $$(".journey-dot");
      const routeSegments = $$(".route-segment");
      const journeyFill = $(".journey-fill");
      journeyStops.forEach((stop, index) => {
        ScrollTrigger.create({
          trigger: stop,
          start: "top 58%",
          end: "bottom 58%",
          onToggle: (self) => {
            if (!self.isActive) return;
            journeyStops.forEach((item) => item.classList.remove("on"));
            journeyDots.forEach((dot) => dot.classList.remove("on", "past"));
            routeSegments.forEach((segment) => segment.classList.remove("on"));
            stop.classList.add("on");
            journeyDots.forEach((dot, dotIndex) => {
              if (dotIndex < index) dot.classList.add("past");
              if (dotIndex === index) dot.classList.add("on");
            });
            routeSegments.forEach((segment, segmentIndex) => {
              if (segmentIndex < index) segment.classList.add("on");
            });
            if (journeyFill) {
              journeyFill.style.transform = `scaleY(${(index + 1) / journeyStops.length})`;
            }
            setActiveJourney(index);
          },
        });
      });

      if (finePointer) {
        const cursor = $(".cur");
        if (cursor) {
          const quickX = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
          const quickY = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });
          const move = (event: PointerEvent) => {
            cursor.style.opacity = "1";
            quickX(event.clientX - 7);
            quickY(event.clientY - 7);
          };
          window.addEventListener("pointermove", move);
          cleanups.push(() => window.removeEventListener("pointermove", move));

          $$("a,button,.card").forEach((element) => {
            const enter = () => gsap.to(cursor, { scale: 3, duration: 0.3 });
            const leave = () => gsap.to(cursor, { scale: 1, duration: 0.3 });
            element.addEventListener("pointerenter", enter);
            element.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              element.removeEventListener("pointerenter", enter);
              element.removeEventListener("pointerleave", leave);
            });
          });
        }

        $$(".mg").forEach((element) => {
          const move = (event: PointerEvent) => {
            const rect = element.getBoundingClientRect();
            gsap.to(element, {
              x: (event.clientX - rect.left - rect.width / 2) * 0.3,
              y: (event.clientY - rect.top - rect.height / 2) * 0.4,
              duration: 0.4,
            });
          };
          const leave = () => gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" });
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerleave", leave);
          });
        });

        const dock = $(".dock");
        const dockAnchors = $$(".dock a");
        if (dock) {
          const move = (event: PointerEvent) => {
            dockAnchors.forEach((anchor) => {
              const rect = anchor.getBoundingClientRect();
              const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
              gsap.to(anchor, {
                scale: 1 + 0.45 * Math.max(0, 1 - distance / 110),
                duration: 0.25,
                overwrite: "auto",
              });
            });
          };
          const leave = () => gsap.to(dockAnchors, { scale: 1, duration: 0.4 });
          dock.addEventListener("pointermove", move);
          dock.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            dock.removeEventListener("pointermove", move);
            dock.removeEventListener("pointerleave", leave);
          });
        }
      }

      ["hero", "work", "projects", "flow", "demo", "xp"].forEach((id, index) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive) return;
            $$(".dock a").forEach((anchor) => anchor.classList.remove("on"));
            const target = $$(".dock a")[index];
            target?.classList.add("on");
          },
        });
      });
    };

    void run();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <>
      <div className="pre">
        <div className="pl l" />
        <div className="pl r" />
        <div className="pc m">
          <b>
            <span id="pn">0</span>%
          </b>
          <em>Aman Dwivedi · loading</em>
        </div>
      </div>

      <div className="bar" />
      <div className="cur" />

      <Link className="logo" href="#hero">
        Aman<span style={{ color: "var(--ac)" }}>.</span>
      </Link>
      <div className="avail m shine">● Available · Dubai</div>
      <nav className="dock" aria-label="Sections">
        {navItems.map(([href, label]) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>

      <div className="main">
        <section id="hero">
          <div className="aur">
            <i />
            <i />
            <i />
          </div>
          <canvas id="pt" />
          <div className="spot" />
          <div className="hin">
            <p className="lab m scr" data-t="Full-stack engineer · Real-time trading systems">
              Full-stack engineer · Real-time trading systems
            </p>
            <h1>
              <span className="ln">
                <span className="sp">I build</span>
              </span>
              <span className="ln">
                <span className="sp">real-time</span>
              </span>
              <span className="ln">
                <span className="sp">systems that</span>
              </span>
              <span className="ln">
                <span className="flip">
                  {["trade.", "stream.", "route.", "scale."].map((word) => (
                    <span className="gt" key={word}>
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="sub fade">
              Trading platforms are my day job: price feeds, order routing, and the services that
              keep them in sync. Based in Dubai, available immediately.
            </p>
            <div className="cta fade">
              <Button asChild variant="primary" magnet>
                <Link href="#work">See the work</Link>
              </Button>
              <Button asChild magnet>
                <Link href="#contact">Get in touch</Link>
              </Button>
            </div>
          </div>

          <div className="tick m fade">
            <small>EURUSD · simulated</small>
            <div>
              <span>bid</span>
              <span className="up">{tick.bid}</span>
            </div>
            <div>
              <span>ask</span>
              <span className="dn">{tick.ask}</span>
            </div>
            <div>
              <span>spread</span>
              <span>{tick.spread}</span>
            </div>
          </div>
        </section>

        <div className="rows m" aria-label="Tech stack">
          {techRows.map((row, rowIndex) => (
            <div className={`row ${rowIndex === 1 ? "rv2" : ""}`} key={row.join("-")}>
              {repeated(row).map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          ))}
        </div>

        <section id="about">
          <p className="lab m scr" data-t="About">
            About
          </p>
          <p className="scrub">
            I'm a full-stack engineer in Dubai who builds the parts of trading platforms most people
            never see: real-time price feeds, order routing, and the services that keep them in sync.
            Node.js and TypeScript at the core, WebSockets, gRPC and Kafka around it, AWS underneath.
          </p>
          <div className="stats">
            {[
              ["3.5", "years building production systems"],
              ["15", "production servers operated on AWS"],
              ["6", "featured systems below"],
            ].map(([value, label]) => (
              <div className="stat rv" key={label}>
                <div className="n">
                  <span data-n={value}>{value}</span>+
                </div>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="drift m" aria-hidden="true">
          WebSockets · gRPC · Protobuf · Kafka ·
        </div>

        <section id="work">
          <div className="track">
            <div className="intro">
              <p className="lab m scr" data-t="Selected work">
                Selected work
              </p>
              <h2 data-split>Systems I've built.</h2>
              <p>Scroll sideways through the core systems and infrastructure I've worked on.</p>
            </div>
            {coreSystems.map((project, index) => (
              <article
                className="card"
                key={project.title}
                onPointerMove={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
                  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
                }}
              >
                <div>
                  <div className="no m">{String(index + 1).padStart(2, "0")}</div>
                  <h3>{project.title}</h3>
                  <p>{project.body}</p>
                </div>
                <div className="tags">
                  {project.tags.map((tag) => (
                    <span className="m" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects">
          <p className="lab m scr" data-t="Projects">
            Projects
          </p>
          <h2 data-split>Links worth opening.</h2>
          <p className="sub">
            Explore live trading and fleet management projects, alongside public demos and builds.
          </p>
          <div className="project-grid">
            {portfolioProjects.map((project) => (
              <article className="project-card rv" key={project.title}>
                <div>
                  <p className="m">{project.tags.join(" / ")}</p>
                  <h3>{project.title}</h3>
                  <span>{project.body}</span>
                </div>
                <Link
                  className="project-link m mg"
                  href={project.href}
                  target={project.href.startsWith("https://") ? "_blank" : undefined}
                  rel={project.href.startsWith("https://") ? "noopener noreferrer" : undefined}
                >
                  {project.linkLabel}
                  <ArrowUpRight size={14} strokeWidth={2} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="flow">
          <p className="lab m scr" data-t="Architecture">
            Architecture
          </p>
          <h2 data-split>From leader trade to reconciled fill.</h2>
          <div className="flow">
            <div className="rail" />
            <div className="fill" />
            <div className="beam" />
            {flowSteps.map(([title, body]) => (
              <div className="st" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="demo">
          <p className="lab m scr" data-t="Interactive demo">
            Interactive demo
          </p>
          <h2 data-split>The market, in motion.</h2>
          <p className="sub">
            Explore an interactive trading chart. Switch markets and timeframes, inspect
            candlesticks, and try technical indicators.
          </p>
          <TradingChart />
        </section>

        <section id="xp">
          <p className="lab m scr" data-t="Career journey">
            Career journey
          </p>
          <h2 data-split>From Sendhwa to Dubai.</h2>
          <div className="journey-wrap">
            <div className="journey-list">
              <div className="rail"></div>
              <div className="journey-fill"></div>
              {journey.map((stop, index) => (
                <article className={`journey-stop ${index === 0 ? "on" : ""}`} key={stop.place}>
                  <p className="m">{stop.period}</p>
                  <h3>{stop.place}</h3>
                  <strong>{stop.title}</strong>
                  <span>{stop.body}</span>
                </article>
              ))}
            </div>
            <div className="globe-panel" aria-label="Career route map">
              <JourneyGlobe activeIndex={activeJourney} />
              <div className="globe-legend">
                {journey.map((stop, index) => (
                  <span className={index <= activeJourney ? "on" : ""} key={stop.place}>
                    {stop.place.split(",")[0]}
                  </span>
                ))}
              </div>
              <p className="m">Scroll the journey. The route lights up stop by stop.</p>
            </div>
          </div>
        </section>
      </div>

      <footer id="contact">
        <p className="lab m scr" data-t="Contact">
          Contact
        </p>
        <h2 className="gt">Let's talk.</h2>
        <div className="links">
          <Button variant="primary" magnet mono onClick={copyEmail}>
            {copied ? "Copied" : "Copy email"}
          </Button>
          <Button asChild magnet>
            <a href="https://linkedin.com/in/aman-dwivedi-1357ad">LinkedIn</a>
          </Button>
          <Button asChild magnet>
            <a href="tel:+971521135798">+971 52 1135798</a>
          </Button>
        </div>
        <small className="m">{email} · Dubai, UAE · Employment visa</small>
      </footer>
    </>
  );
}
