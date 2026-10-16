export const navItems = [
  ["#hero", "Home"],
  ["#work", "Systems"],
  ["#projects", "Projects"],
  ["#flow", "Flow"],
  ["#demo", "Demo"],
  ["#xp", "Journey"],
  ["#contact", "Contact"],
] as const;

export const techRows = [
  [
    "Node.js",
    "TypeScript",
    "gRPC",
    "Protobuf",
    "WebSockets",
    "Kafka",
    "Redis Streams",
    "RabbitMQ",
    "BullMQ",
  ],
  [
    "AWS ECS",
    "EKS",
    "Docker",
    "Jenkins",
    "Grafana Loki",
    "MongoDB",
    "PostgreSQL",
    "TimescaleDB",
    "React",
    "Next.js",
  ],
] as const;

export const coreSystems = [
  {
    title: "Copy trading engine",
    body: "Sizes each follower's trade proportionally from leader volume and allocated capital, batches orders over WebSocket, and reconciles filled, partial and closed states.",
    tags: ["Node.js", "WebSocket", "Reconciliation"],
  },
  {
    title: "Real-time price feed",
    body: "Live prices and trade status (accepted, rejected, filled, partially filled) streamed over WebSockets with Protobuf binary encoding.",
    tags: ["Protobuf", "WebSocket"],
  },
  {
    title: "OMS and gRPC mesh",
    body: "gRPC and Protobuf messaging between the in-house B-book backend and the Order Management Service routing trades to liquidity providers.",
    tags: ["gRPC", "Protobuf", "OMS"],
  },
  {
    title: "Whitelabel trading platform",
    body: "Modular framework for trading desks with tenant isolation, position-state tracking and real-time execution broadcast, decoupled from matching on ECS.",
    tags: ["Redis Cluster", "RabbitMQ", "BullMQ"],
  },
  {
    title: "CriCludo backend",
    body: "Backend for a real-time multiplayer game with multi-node event broadcasting over Redis Streams and Pub/Sub.",
    tags: ["Node.js", "Redis Streams", "MongoDB"],
  },
  {
    title: "Fleet management",
    body: "MERN booking app with a real-time admin panel, Firebase OTP sign-in, and a booking engine that prevents concurrent scheduling conflicts.",
    tags: ["MERN", "Firebase", "PM2"],
  },
] as const;

export const portfolioProjects = [
  {
    title: "Global Apex Markets trading platform",
    body: "Live trading terminal for the real-time trading platform I worked on.",
    href: "https://terminal.globalapexmarkets.com/",
    linkLabel: "Open trading terminal",
    tags: ["Trading", "Realtime", "WebSocket"],
  },
  {
    title: "CriCludo",
    body: "Real-time multiplayer cricket game backend with Redis Streams, Pub/Sub and MongoDB.",
    href: "#contact",
    linkLabel: "Add live link",
    tags: ["Realtime", "Game backend", "Redis"],
  },
  {
    title: "Fleet management app",
    body: "MERN booking platform with Firebase OTP, admin workflows and scheduling conflict protection.",
    href: "https://4wheeltravels.com/",
    linkLabel: "Visit live site",
    tags: ["MERN", "Firebase", "Bookings"],
  },
  // {
  //   title: "Interactive trading chart",
  //   body: "Explore market prices, candlestick charts, timeframes and technical indicators powered by TradingView.",
  //   href: "#demo",
  //   linkLabel: "Open demo",
  //   tags: ["Markets", "Charts", "TradingView"],
  // },
] as const;

export const flowSteps = [
  ["Leader trade event", "A trade from the leader account arrives as an event."],
  ["Copy engine", "Calculates each follower's volume, respecting broker minimum and step size."],
  ["Batch over WebSocket", "Follower payloads are batched and written to the socket."],
  ["Execution backend", "Executes the trades on behalf of followers."],
  ["OMS over gRPC", "Routes trades to liquidity providers."],
  [
    "Reconciliation",
    "Filled, partially filled and closed updates flow back and update each follower trade.",
  ],
] as const;

export const journey = [
  {
    place: "Sendhwa, Madhya Pradesh",
    period: "2016 - 2018",
    title: "10th and 12th",
    body: "The starting point: school years, discipline, and the first shape of ambition.",
    lat: 21.6856,
    lng: 75.0964,
  },
  {
    place: "Indore",
    period: "2020 - 2022",
    title: "BSc in Computer Science",
    body: "Built the academic base, got deeper into programming, and started turning curiosity into craft.",
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    place: "Bangalore",
    period: "2022 - 2023",
    title: "Full-stack development trainee",
    body: "The training arc: full-stack fundamentals, product thinking, and writing code with professional intent.",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    place: "Hyderabad",
    period: "2023 - 2024",
    title: "Ray Formula - first job",
    body: "First production role, shipping MERN features, real-time admin flows, OTP onboarding and booking systems.",
    lat: 17.385,
    lng: 78.4867,
  },
  {
    place: "Dubai",
    period: "2025 - present",
    title: "9X Technology - current role",
    body: "Trading systems, WebSockets, gRPC, Protobuf, Kafka, AWS and the real-time infrastructure I work on now.",
    lat: 25.2048,
    lng: 55.2708,
  },
] as const;
