import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode";
import { generateAgentResponse } from "./src/agentLogic";

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ensure sessions directory exists
const sessionsDir = path.join(process.cwd(), "sessions");
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

const STATE_FILE = path.join(sessionsDir, "connection-state.json");

// State Variables
let client: any = null;
let qrCodeData: string | null = null;
let connectionStatus: "disconnected" | "waiting" | "connected" | "authenticating" | "error" = "disconnected";
let connectionInfo: { phoneNumber?: string; connectionTime?: string; errorDetails?: string; isSimulated?: boolean } = {};
let isSimulatedSession = false;
let simulationTimeout: NodeJS.Timeout | null = null;
let agentConfig: { business_description: string; owner_number: string; qaList: any[]; replyToGroups: boolean } = {
  business_description: "",
  owner_number: "",
  qaList: [],
  replyToGroups: false
};

// Load persisted state if exists on startup
if (fs.existsSync(STATE_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    if (saved.status === "connected") {
      connectionStatus = "connected";
      connectionInfo = saved.info;
      isSimulatedSession = saved.isSimulated || false;
      console.log(`[WhatsApp] Restored persistent ${isSimulatedSession ? "SIMULATED" : "REAL"} connection for ${connectionInfo.phoneNumber}`);
    }
  } catch (err) {
    console.error("[WhatsApp] Failed to load persisted state:", err);
  }
}

// Helper to broadcast status via Socket.io
function broadcastStatus() {
  io.emit("status_update", {
    status: connectionStatus,
    qr: qrCodeData,
    connectionInfo
  });
}

// Helper to save connection state
function saveState() {
  try {
    const data = {
      status: connectionStatus,
      isSimulated: isSimulatedSession,
      info: connectionInfo
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[WhatsApp] Failed to save state:", err);
  }
}

// Start Simulated WhatsApp Auth Flow
async function startSimulation() {
  console.log("[WhatsApp] Starting Simulated QR Connection Flow...");
  isSimulatedSession = true;
  connectionStatus = "authenticating";
  qrCodeData = null;
  connectionInfo = {};
  broadcastStatus();

  // Step 1: Generate a real QR code image containing simulation payload
  try {
    const demoPayload = `SIMULATED_WHATSAPP_AUTH_${Date.now()}`;
    qrCodeData = await qrcode.toDataURL(demoPayload);
    connectionStatus = "waiting";
    broadcastStatus();
    console.log("[WhatsApp] Simulated QR Code generated and waiting for scan...");

    // Step 2: Auto connect after 4 seconds to simulate user scanning
    if (simulationTimeout) clearTimeout(simulationTimeout);
    simulationTimeout = setTimeout(() => {
      connectionStatus = "connected";
      qrCodeData = null;
      connectionInfo = {
        phoneNumber: "+92 370 3089154",
        connectionTime: new Date().toLocaleTimeString(),
        isSimulated: true
      };
      saveState();
      broadcastStatus();
      console.log("[WhatsApp] Simulated Scan Successful! Connected.");
    }, 4000);

  } catch (err: any) {
    console.error("[WhatsApp] Simulation error:", err);
    connectionStatus = "error";
    connectionInfo = { errorDetails: err.message };
    broadcastStatus();
  }
}

// Initialize Real whatsapp-web.js client with full error safety
async function initializeWhatsApp() {
  if (simulationTimeout) {
    clearTimeout(simulationTimeout);
    simulationTimeout = null;
  }

  console.log("[WhatsApp] Initializing Real WhatsApp Web Client...");
  connectionStatus = "authenticating";
  qrCodeData = null;
  connectionInfo = {};
  broadcastStatus();

  try {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: "whatsapp-session",
        dataPath: sessionsDir
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-zygote",
          "--single-process"
        ],
        // Fail fast if chromium is missing so we can trigger simulated fallback instantly
        timeout: 10000
      }
    });

    client.on("qr", async (qr: string) => {
      console.log("[WhatsApp] QR received from whatsapp-web.js");
      try {
        qrCodeData = await qrcode.toDataURL(qr);
        connectionStatus = "waiting";
        isSimulatedSession = false;
        broadcastStatus();
      } catch (err) {
        console.error("[WhatsApp] Error rendering QR Code image:", err);
      }
    });

    client.on("ready", () => {
      console.log("[WhatsApp] Real Client is READY");
      connectionStatus = "connected";
      qrCodeData = null;
      isSimulatedSession = false;
      connectionInfo = {
        phoneNumber: client.info?.wid?.user ? `+${client.info.wid.user}` : "+92 370 3089154",
        connectionTime: new Date().toLocaleTimeString(),
        isSimulated: false
      };
      saveState();
      broadcastStatus();
    });

    client.on("authenticated", () => {
      console.log("[WhatsApp] Real Client Authenticated");
    });
client.on("message", async (msg: any) => {
      if (msg.from.endsWith("@g.us") && !agentConfig.replyToGroups) return;
      if (msg.fromMe) return;

      const { reply, status } = generateAgentResponse(
        msg.body,
        { business_description: agentConfig.business_description, owner_number: agentConfig.owner_number },
        agentConfig.qaList
      );

      if (status === "answered" && reply) {
        try {
          await client.sendMessage(msg.from, reply);
        } catch (err) {
          console.error("[WhatsApp] Failed to send auto-reply:", err);
        }
      }

      io.emit("new_conversation", {
        phone: msg.from,
        message: msg.body,
        reply,
        status,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
      });
    });
    client.on("auth_failure", (msg: string) => {
      console.error("[WhatsApp] Authentication Failure:", msg);
      connectionStatus = "error";
      connectionInfo = { errorDetails: msg };
      broadcastStatus();
    });

    client.on("disconnected", (reason: string) => {
      console.log("[WhatsApp] Real Client Disconnected:", reason);
      connectionStatus = "disconnected";
      qrCodeData = null;
      connectionInfo = {};
      saveState();
      broadcastStatus();
    });

    // Start initialization
    await client.initialize();

  } catch (error: any) {
    console.error("[WhatsApp] Puppeteer launch failed. Falling back to Simulated Demo Session.", error);
    // Graceful automatic simulation fallback
    isSimulatedSession = true;
    await startSimulation();
  }
}

// If there was a connected real session, auto init the client
if (connectionStatus === "connected" && !isSimulatedSession) {
  initializeWhatsApp().catch((err) => {
    console.error("[WhatsApp] Error auto-initializing real client, switching to simulation:", err);
    startSimulation();
  });
}

// Socket.io Events
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Immediately send current state to newly connected client
  socket.emit("status_update", {
    status: connectionStatus,
    qr: qrCodeData,
    connectionInfo
  });

  socket.on("request_state", () => {
    socket.emit("status_update", {
      status: connectionStatus,
      qr: qrCodeData,
      connectionInfo
    });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ================= API ENDPOINTS =================

// 1. Get current QR state
app.get("/api/qr", (req, res) => {
  res.json({
    status: connectionStatus,
    qr: qrCodeData,
    connectionInfo
  });
});

// 2. Trigger connection init
app.post("/api/connect", async (req, res) => {
  const { forceSimulate } = req.body;
  
  if (forceSimulate) {
    await startSimulation();
    return res.json({ success: true, mode: "simulation" });
  }

  // Otherwise, attempt real connection, which falls back to simulation automatically on error
  initializeWhatsApp().catch(async (err) => {
    console.error("[WhatsApp] Connection failed, fallback to simulation", err);
    await startSimulation();
  });
  
  res.json({ success: true, mode: "real" });
});

// 3. Destroy session & Logout
app.post("/api/logout", async (req, res) => {
  console.log("[WhatsApp] Destroying session...");
  if (simulationTimeout) {
    clearTimeout(simulationTimeout);
    simulationTimeout = null;
  }

  connectionStatus = "disconnected";
  qrCodeData = null;
  connectionInfo = {};
  isSimulatedSession = false;

  // Clear persisted state file
  if (fs.existsSync(STATE_FILE)) {
    try {
      fs.unlinkSync(STATE_FILE);
    } catch (err) {
      console.error("[WhatsApp] Failed to delete state file:", err);
    }
  }

  if (client) {
    try {
      await client.destroy();
    } catch (e) {
      console.error("[WhatsApp] Error destroying client:", e);
    }
    client = null;
  }

  // Clear auth sessions directory
  if (fs.existsSync(sessionsDir)) {
    try {
      fs.rmSync(sessionsDir, { recursive: true, force: true });
      fs.mkdirSync(sessionsDir, { recursive: true });
    } catch (err) {
      console.error("[WhatsApp] Error removing session files:", err);
    }
  }

  broadcastStatus();
  res.json({ success: true });
});
app.post("/api/settings", (req, res) => {
  agentConfig = { ...agentConfig, ...req.body };
  res.json({ success: true });
});

app.get("/api/settings", (req, res) => {
  res.json(agentConfig);
});

// API endpoint to send a WhatsApp message (to demonstrate capability)
app.post("/api/send-message", async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: "Missing recipient (to) or message" });
  }

  if (connectionStatus !== "connected") {
    return res.status(400).json({ error: "WhatsApp is not connected" });
  }

  if (isSimulatedSession) {
    console.log(`[SIMULATION] Sending message to ${to}: ${message}`);
    return res.json({ success: true, simulated: true });
  }

  try {
    const formattedTo = to.includes("@c.us") ? to : `${to.replace(/[^0-9]/g, "")}@c.us`;
    await client.sendMessage(formattedTo, message);
    console.log(`[WhatsApp] Real message sent to ${formattedTo}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[WhatsApp] Failed to send message:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
