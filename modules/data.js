/* ─── PROJECT DATA ─── */
import { prefersReducedMotion, escHtml } from './utils.js';

export const PROJECTS = [
  {
    id: 'FILE-000', active: true, cat: 'sys',
    ariaLabel: 'FIELDSTATION ZERO: This site. Experimental zero-dependency portfolio. Press Enter to view details.',
    codename: 'FIELDSTATION ZERO', domain: 'Design · Systems', metric: '0 dependencies',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'FIELDSTATION ZERO',
      badge: 'Active, Present | Design Engineering · Systems',
      role: 'Sole Designer & Engineer', status: 'ONGOING', unredacted: true,
      overview: 'This site. Zero dependencies: pure HTML, CSS Custom Properties, Vanilla JS. No bundler. No framework. Ships as plain files.||The design thesis: a classified-file / dossier aesthetic built to feel like a discovered artifact rather than a template. CRT radar, WebGL voxels, dossier FLIP, boot sequence; each effect engineered from first principles because it had to exist, not because a library made it easy.||The most experimental design project in this archive.',
      architecture: 'Stack: HTML · CSS Custom Properties · Vanilla JS · WebGL · Canvas 2D · View Transitions API||12+ ES modules: dossier panel (FLIP + View Transitions morph), CRT radar (phosphor ring-buffer, noise frames, hit-tested blips), WebGL voxel background (fragment shader, no Three.js), boot sequence (staged CRT reveal), shatter-to-radar transition, cursor trail, ambient particles, scroll reveals, count-up timers, nav drawer, custom scrollbar.||Zero build step. No tree-shaking needed when there are no dependencies to shake.',
      contribution: 'Sole designer and engineer. Conceived every layer: the classified aesthetic, the CRT radar as project index, the dossier as a file detail view, the shatter animation as a mode switch.||Key bets: View Transitions API for zero-jank FLIP between manifest row and detail panel; WebGL voxel field in the hero without Three.js; phosphor persistence via ring buffer of past sweep angles; shatter glass physics as an interaction metaphor rather than pure decoration.',
      outcome: 'The most technically ambitious static site in this archive. Zero production dependencies. Awarded itself Best UI/UX (contested).',
      stat: '0', statLabel: 'production dependencies', statCount: '0', statSuffix: ' deps',
      stat2: '12+', stat2Label: 'ES modules',
      github: 'https://github.com/zParik/portfolioPage',
    },
  },
  {
    id: 'FILE-001', active: true, cat: 'security',
    ariaLabel: 'PaleGuard: Vision-based EDR, active research. Press Enter to view details.',
    codename: 'PaleGuard', domain: 'CyberSec · CV', metric: '88% detection',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'PaleGuard',
      badge: 'Active — Present | CyberSecurity — Computer Vision',
      role: 'Sole Architect & Researcher', status: 'ONGOING', unredacted: true,
      overview: 'Proactive malware detection: PE binaries mapped into 6-channel 3D volumetric tensors, classified by a 3D ResNet-18.||Trained on ~58,000 samples (VirusShare + clean Windows PEs). Paper under review at Scientific Reports.||Inference: 3.3ms per sample.',
      architecture: 'Stack: 3D ResNet-18 + SE attention + Morton Z-order encoding||6 PE sections (.text, .code, .rdata, .idata, .data, .edata) mapped into a 64³ voxel grid via Morton Z-curve for locality preservation.||Each voxel: 6 channels — raw byte value, local entropy, code mask, import density, string density, data-presence mask.||Masked global average pooling + SE attention resolves density shortcut-learning.',
      contribution: 'Conceived the research hypothesis and designed the Morton-curve volumetric encoding scheme.||Identified and resolved density shortcut-learning via masking + SE attention — the key technical insight.||Ran all experiments and drafted the manuscript.',
      outcome: '88% accuracy on family-disjoint held-out evaluation (TheZoo vs VirusShare) with 11% FNR — designed to test generalization to unseen malware families. 99% accuracy / 0.9971 ROC-AUC on random split for comparison.',
      stat: '88%', statLabel: 'new family detection', statCount: '88', statSuffix: '%',
      stat2: '3.3ms', stat2Label: 'inference time',
    },
  },
  {
    id: 'FILE-002', active: true, cat: 'sys',
    ariaLabel: 'Qyra: Free offline open-source PDF toolkit, alpha released. Press Enter to view details.',
    codename: 'Qyra', domain: 'Systems · Tools', metric: 'Alpha Released',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'Qyra',
      badge: 'Active — Present | Systems · Developer Tools',
      role: 'Sole Developer', status: 'ONGOING', unredacted: true,
      overview: 'Free, offline, open-source PDF Swiss Army Knife — desktop-native, no cloud, no subscriptions.||Alpha shipped for Windows (.msi/.exe) and Linux (.deb/.rpm/.AppImage). Linux AppImage pre-patched for Wayland/Hyprland with DMA-buf renderer disabled — zero env-var workarounds required.||Built with Tauri v2 + React 19 + TypeScript: Rust backend for PDF operations, React frontend for drag-and-drop document management.',
      architecture: 'Stack: Tauri v2 (Rust) + React 19 + TypeScript + Vite + Tailwind CSS v4||Rust backend handles PDF manipulation via Tauri invoke commands. Frontend: React Router v7, Zustand state, @dnd-kit for drag-and-drop page reordering.||Freeform annotation mode in spec: pressure-sensitive stylus via Pointer Events API, perfect-freehand stroke smoothing, palm rejection — sidecar .notes persistence (Phase A) → lopdf PDF ink annotation embedding (Phase B).',
      contribution: 'Sole developer. Designed the full architecture — Rust/Tauri backend, React frontend, CI/CD pipeline for multi-platform binary releases.||Authored the Freeform Sketch Mode specification: Xournal++/GoodNotes-style annotation layer with pressure sensitivity, palm rejection, lasso tool, and SVG stroke rendering.',
      outcome: 'Alpha release live on GitHub with Windows and Linux binaries. Wayland compatibility solved without user-side workarounds — AppImage self-patches the DMA-buf renderer at runtime.',
      stat: 'Alpha', statLabel: 'shipped — open source',
      stat2: 'Win + Linux', stat2Label: 'native binaries',
      github: 'https://github.com/zParik/Qyra',
    },
  },
  {
    id: 'FILE-003', active: true, cat: 'sys',
    ariaLabel: 'ZonFormer: Deep RL for HPC batch scheduling, audited for realism and transfer. Press Enter to view details.',
    codename: 'ZonFormer', domain: 'Deep RL · Systems', metric: '+33.6% headroom',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'Generate, Generalize, Audit',
      badge: 'Active — Present | Deep Reinforcement Learning · Systems',
      role: 'Sole Researcher & Engineer', status: 'ONGOING', unredacted: true,
      overview: 'Deep RL for HPC batch scheduling — audited for realism, transfer and measurement rather than driven toward a win.||The opening question: do published "DRL beats backfilling" gains survive cleaned traces, honest baselines and zero-shot evaluation? Largely they do not. Worse, the synthetic workload generators the field validates on are not downstream-valid in the first place.||Current phase: portfolio distillation. The finding that reframed the project is that no single policy wins everywhere — learned or hand-written.',
      architecture: 'Stack: PyTorch + SB3 PPO + a discrete-event cluster simulator||ZonFormer: relational attention over the job queue with a glimpse-pointer head, reading the cluster availability timeline directly. The MoE variant adds a shared FFN plus 8 zero-init routed experts, top-k routing, Switch balance and z-loss; n_experts=0 is bit-identical to the dense model across 200 real-checkpoint decisions.||A guarded (shielded) environment makes the catastrophic failure mode structurally impossible — worst case is EASY, by construction and by property test.||Every artifact is stamped with git commit, dirty flag, library versions and command line. Traces are pinned by SHA-256 and by SWF header fingerprint, so any number in results/ traces back to the code that produced it.',
      contribution: 'Sole researcher and engineer.||Built the downstream-equivalence bar: a generator is judged by whether a scheduler ranks the same on it, not by how its marginals look. Open-loop NHPP generators pass on 1 of 6 traces; the closed-loop user-feedback generator built here passes on 3 of 6. KS tests on runtimes and sizes do not detect the failure at all.||Designed EASY-PC, the guarded environment, the ZonFormer architecture, and the portfolio-distillation pipeline — behaviour cloning with three DAgger rounds, then PPO, then distilling six teachers into a single policy.||Kept the record honest against my own results; the failures below are logged, not tuned away.',
      outcome: 'The load-bearing measurement: a heuristic-only oracle has no headroom — median 0.0% across 4 of 17 traces. Add the learned checkpoints and the per-episode oracle opens +33.6% over the best heuristic. An RL checkpoint is the strongest teacher on 23% of episodes and the cloned policy on 8.7%, covering regimes the best heuristic does not own. The learned models are what make the ensemble ceiling exist.||Falsified my own explanation: training inside the equivalence-passing workload family wins 4 of 6 real traces and still collapses out of distribution.||Found mean normalized regret unsafe as a transfer metric — one near-idle machine puts a floor value in the denominator and moves the mean by two orders of magnitude, reversing rankings.||Gates recorded as failed where they failed: behaviour cloning adjudicated NEAR-MISS at 0.7367 against a 0.7292 bar; the first PPO run discarded once a pooled-EASY normalizer was found to make fragmented episodes unwinnable by construction; decision cost measured at 24.7ms against a 0.85ms teacher — 29x over the bar, reported as a failed gate.||Final ladder in progress: 5 of 17 traces scored, the hard traces still outstanding.',
      stat: '+33.6%', statLabel: 'oracle headroom over best heuristic',
      stat2: '17 traces', stat2Label: 'held out, run once',
    },
  },
  {
    id: 'FILE-004', active: true, cat: 'sys',
    ariaLabel: 'EMBARGO: Sealed systems research, manuscript under peer review. Press Enter to view details.',
    codename: 'EMBARGO', domain: 'Systems Research', metric: 'SEALED',
    dossier: {
      clearance: 'SEALED — PENDING REVIEW', name: 'EMBARGO',
      badge: 'Under Peer Review | Details Sealed',
      role: 'Lead Author & Systems Engineer', status: 'UNDER REVIEW', unredacted: true,
      overview: 'Manuscript under peer review at an anonymised venue. Identifying details are withheld until review concludes — this entry is deliberately incomplete.||Domain, method and system name: [[EXPUNGED]]||What can be stated: a [[26]] runs end to end as a live discrete-event simulation, streaming every tick to a browser dashboard where [[31]] can be injected into the running system and watched as they propagate through it.',
      architecture: 'Stack: [[16]] · [[11]] · [[14]] — withheld pending review||Three languages share a single computational contract, cross-checked against a frozen golden fixture. The core numerical engine is validated against an independent reference implementation to within 1e-6.||Method and solver layer: [[EXPUNGED]]||The same pipeline runs at three scales; the cross-layer result holds at the largest one.',
      contribution: 'Lead author, and sole engineer on the systems side.||Built the simulation, the live streaming layer, the fault-injection controls, the validation harness and the reproducibility pipeline.||Specific technical contributions: [[EXPUNGED]]',
      outcome: 'One command reproduces every headline number byte-for-byte on the same commit, stamped with the git commit that produced it.||Quantitative results: [[EXPUNGED]]||Released as a reusable benchmark — documented data contracts, a bring-your-own-solver API and a frozen frame schema. This dossier unseals on publication.',
      stat: 'SEALED', statLabel: 'pending peer review',
      stat2: 'Byte-exact', stat2Label: 'reproducible on commit',
    },
  },
  {
    id: 'FILE-005', active: true, cat: 'sys',
    ariaLabel: 'GREENWAVE: Adaptive traffic signal optimization for lane-free heterogeneous traffic. Press Enter to view details.',
    codename: 'GREENWAVE', domain: 'Algorithms · RL', metric: 'Lane-free TSC',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'Adaptive Traffic Signal Optimization',
      badge: 'Active — Present | Algorithms · Reinforcement Learning',
      role: 'Sole Author', status: 'ONGOING', unredacted: true,
      overview: 'Minimising average vehicle waiting time at signalised intersections from real-time vehicle density. Two deliberately separated tracks: textbook baselines that everything else must beat, and a research track aimed at a paper.||Track A is complete — five classic controllers (fixed-time, greedy, shortest-wait, dynamic programming, graph) in portable C11/C++17 with no external dependencies, each with full complexity analysis.||Track B is scaffolded and deliberately unbuilt. Its observation, action and reward spaces are designed around the novel contribution, so it stays gated until that contribution is settled rather than bolted on afterward.',
      architecture: 'Stack: C11/C++17 baselines + Python microsimulation and Gym-style RL environment||Selected contribution: a β-family signal policy that recovers longest-queue-first and max-pressure as special cases, with learned online β adaptation and a constructive per-movement worst-case-delay guarantee.||Evaluated on a lane-free heterogeneous simulation — mixed vehicle classes without lane discipline — rather than the lane-based networks the literature assumes.||Deterministic given a seed. Track A verified under both MSVC and gcc.',
      contribution: 'Sole author. Built all five baselines and their complexity analysis, ran the prior-art survey, and selected the contribution the research track is designed around.||Ran that survey under a verification discipline carried over from this project\'s own earlier attempt: every source tagged [V] when title, venue and year were confirmed on the publisher page, or [U] when seen only in search snippets. No [U] claim reaches the paper without checking the primary source, and unreachable papers are listed for retrieval rather than cited on faith.',
      outcome: 'The gap is documented rather than assumed. A 2025 paper states plainly that accurate vehicle-specific delay information is infeasible to obtain under the heterogeneous, lane-less conditions found in countries like India — then sidesteps it, using scalar queue length on homogeneous traffic. A 2024/25 review of the field does not treat lane-less traffic as a focus at all.||Track A builds and passes smoke tests on both toolchains. Track B implementation follows the selected angle.',
      stat: 'β-family', statLabel: 'LQF ↔ max-pressure, unified',
      stat2: '5 baselines', stat2Label: 'C11, zero dependencies',
    },
  },
  {
    id: 'FILE-006', active: true, cat: 'sys',
    ariaLabel: 'DEVANAGARI: Bilingual Hindi news summarizer and purpose-built Hindi corpus. Press Enter to view details.',
    codename: 'DEVANAGARI', domain: 'NLP · Data', metric: 'ROUGE-L 47.4',
    dossier: {
      clearance: 'ACTIVE RESEARCH', name: 'Bilingual Hindi News Summarizer',
      badge: 'Active — Present | Natural Language Processing · Dataset Engineering',
      role: 'Lead Developer', status: 'ONGOING', unredacted: true,
      overview: 'Extractive Hindi news summarisation with dual-language output — and, the larger half of the work, a Hindi news corpus built from scratch to train it.||Pipeline: Hindi article → TextRank extractive summary → opus-mt-hi-en → English summary, scored with ROUGE and BLEU against XL-Sum Hindi gold summaries.||Phase 2 replaces the borrowed dataset with one collected, cleaned, quality-gated, split, annotated and documented in-house.',
      architecture: 'Stack: Stanza (HDTB Hindi models) + trafilatura + transformers + PyTorch||Collection runs two ways: a robots-aware RSS forward-fill across verified Hindi outlets, and a threaded sitemap backfill that reaches the past year — which RSS structurally cannot, since a feed exposes only its most recent items.||Four stages sit between scrape and dataset: HTML and page-chrome cleaning, dedupe by URL and by opening-prose hash, a quality gate that counts every drop by reason, and splits assigned by sha1(id) % 10000 so a record keeps its split when the corpus grows — no leakage across runs.||Annotation: normalisation → tokenisation → sentence segmentation → lemmatisation → POS tagging → dependency parse → NER. Resumable in slices, since it is the slowest stage.',
      contribution: 'Built the collection, cleaning, annotation and validation pipeline end to end, and the summarisation and evaluation stack above it.||Wrote a Unicode-aware tokeniser for Devanagari so ROUGE and BLEU score Hindi correctly rather than silently mis-segmenting it.||Ran a stratified 100-record audit of gold-summary quality and measured target quality per outlet, so the corpus can be selected on rather than trusted wholesale.',
      outcome: 'mt5-small leads at ROUGE-1 51.63 / ROUGE-L 47.42 / BLEU 30.43 over 403 records, ahead of a lead-3 baseline at 49.46 and IndicBART at 50.12. TextRank trails at 35.31 — the honest ceiling of extractive scoring here.||The audit is the more useful result: 42% of gold summaries are genuinely abstractive, 39% are copied ledes, and the split varies sharply by outlet. Every record carries a summary_is_prefix flag so training can select on it instead of inheriting the noise.||Collection is rate-limited, robots-aware and documented in a datasheet. Outlets that answered 403 to a declared research bot are excluded rather than circumvented by spoofing a browser user-agent, and every dropped URL is recorded so it is not re-added blindly.',
      stat: '47.4', statLabel: 'ROUGE-L, mt5-small',
      stat2: '42% / 39%', stat2Label: 'abstractive vs copied ledes',
    },
  },
  {
    id: 'FILE-007', cat: 'sys',
    ariaLabel: 'VIPER-1: Unity arcade jet combat game generated entirely from code, zero art assets. Press Enter to view details.',
    codename: 'VIPER-1', domain: 'Games · Systems', metric: '0 art assets',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'VIPER-1',
      badge: 'Games · Procedural Systems', role: 'Sole Designer & Engineer', status: 'COMPLETE', unredacted: true,
      overview: 'Unity 6 arcade naval-jet campaign in which the world assembles itself from code at play time. Every level, texture, sound and effect is generated at runtime from a single mission ScriptableObject.||There are no prefabs to wire, no audio files and no image assets in the project. The only non-C# assets are two hand-written URP shaders — the afterburner plume and its heat haze.||Eight-mission campaign: flight school through carrier ops, night strikes and a final assault, against enemies that shoot back.',
      architecture: 'Stack: Unity 6 (URP) + C# — 231 scripts, no art pipeline||A mission is pure data: start and landing base, a target list of type/position/priority/patrol radius, loadout, rules and sky mood. Ground targets generate their own island, and nearby targets share one.||Procedural throughout — audio synthesised at runtime, textures generated in code, terrain and airbases built by mesh factories.||Threat model: gun turrets that track and lead the jet, SAM sites that build a lock and must be broken with flares and G, warships that shell the carrier, and fighters that patrol, engage, and evade once locked.',
      contribution: 'Sole designer and engineer. Built the flight model, runtime world generation, enemy AI, the weapon and radar-lock systems, procedural audio and VFX, the flight HUD and cockpit view, scoring and progression, options and touch controls.||Designed the data-driven mission format so a new mission is authored without writing any code.',
      outcome: 'Playable eight-mission campaign with 3-star scoring, unlockable progression and saved state. Adding a mission needs only a ScriptableObject and a database entry.||The constraint was the point: shipping a full game with no art assets forced every visual and audio decision into code, where it could be parameterised, reused and regenerated.',
      stat: '0', statLabel: 'art assets in project',
      stat2: '231', stat2Label: 'C# scripts',
    },
  },
  {
    id: 'FILE-008', cat: 'security',
    ariaLabel: 'NotBigBrother: Privacy-preserving age verification. Press Enter to view details.',
    codename: 'NotBigBrother', domain: 'Privacy · Crypto', metric: 'Zero PII',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'NotBigBrother',
      badge: 'Privacy — Cryptography',
      role: 'Sole Designer & Implementer', status: 'COMPLETE', unredacted: true,
      overview: 'PoC: privacy-preserving age verification using RSA blind signatures (Chaum scheme).||The verifier never knows where a token is used; the website never learns who the user is.||Zero server callbacks. Zero PII stored.',
      architecture: 'Stack: Node/Express + InsightFace (SCRFD, ONNX) + RSA blind signatures||Three-party flow: Issuer analyzes face and issues blinded token -> User blinds token before submission -> Issuer signs without seeing final form.||Website verifies locally against issuer public key — no round-trip required.',
      contribution: 'Designed the full cryptographic protocol (blind signature flow end-to-end).||Integrated InsightFace/SCRFD via ONNX for age estimation.||Built the Node/Express issuer service.',
      outcome: 'Working PoC demonstrating unlinkable, zero-knowledge age verification. Novel application of Chaum blind signatures to identity verification.',
      stat: 'Zero PII', statLabel: 'stored or transmitted',
      stat2: 'Untraceable', stat2Label: 'by design',
      github: 'https://github.com/zParik/NotBigBrother',
    },
  },
  {
    id: 'FILE-009', cat: 'security',
    ariaLabel: 'ARCHON — Anonymous distributed messaging system. Press Enter to view details.',
    codename: 'ARCHON', domain: 'Privacy', metric: 'AES-256',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'ARCHON',
      badge: 'Privacy', role: 'Full-Stack Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Tor-inspired anonymous distributed messaging. Users identified by cryptographic hash-derived codenames — no email, no real name.||Messages AES-256 encrypted client-side; the relay stores only ciphertext, never plaintext.||Full contact system: bidirectional friend requests, encrypted profiles, read receipts, 7-day message TTL.',
      architecture: 'Stack: Node.js/Express + MongoDB + React 19 + TailwindCSS 4 + Tanstack Router||Three-tier: main server (relay registry + heartbeat) -> independently deployable relay nodes -> React frontend.||Conversation keys via SHA256 of both user hashes; message content, sender hash, receiver hash all AES-encrypted client-side.||Profile fields (username, bio, status) also encrypted. Multi-hop onion routing stubbed for next phase.',
      contribution: 'Sole developer — designed the full distributed architecture from scratch.||Built: relay registration/heartbeat system, anonymous identity generation, JWT auth flow, bidirectional contact system, client-side encryption, entire React frontend.',
      outcome: 'Fully functional 1-to-1 anonymous messaging system. Relay network, encrypted auth, contact management, profile privacy, and end-to-end encrypted messaging all operational. Multi-hop onion routing and perfect forward secrecy are planned next phases.',
      stat: 'AES-256', statLabel: 'end-to-end encrypted',
      stat2: '7-day TTL', stat2Label: 'message lifetime',
      github: 'https://github.com/zParik/ARCHON',
    },
  },
  {
    id: 'FILE-010', cat: 'access',
    ariaLabel: 'VisionAid - YOLOv8x + Depth Anything V2 indoor navigation for visually impaired users. Press Enter to view details.',
    codename: 'VisionAid', domain: 'Accessibility · CV', metric: '16 FPS GPU',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'VisionAid',
      badge: 'Accessibility · Computer Vision', role: 'Lead Developer & Team Lead', status: 'COMPLETE', unredacted: true,
      overview: 'Real-time indoor navigation assistant for the visually impaired. Built for UCSC316L Computer Vision (Fall 2025–26).||Detects 600+ object classes (Open Images V7) via YOLOv8x; monocular depth via Depth Anything V2 Small (14ms GPU).||DeepSORT + MobileNetV2 re-ID tracks objects across frames.||Reactive navigation engine issues directional audio cues (Web Speech API) every 500ms — no fixed depth assumptions.||Hands-free voice command input; gyroscope-based frame rotation correction for phone orientation.',
      architecture: 'Stack: Flask + YOLOv8x + Depth Anything V2 + DeepSORT + TensorRT (NVIDIA RTX)||Mobile browser streams JPEG frames to GPU-accelerated Flask backend. Detection and depth pipelines run async and decoupled.||Reactive navigation engine (replaces classical A*): perspective-aware movement analysis + 500+ object heights DB for motion-based depth calibration.||Request ID tracking eliminates stale-response race conditions. Vanilla JS frontend with Web Speech API for audio I/O.',
      contribution: 'Role: Lead developer in a 3-person team (under Dr. Shunmuga Perumal).||Architected the full CV pipeline: YOLOv8x inference, Depth Anything V2 integration, DeepSORT tracking, async depth pipeline, reactive navigation engine, JSON-safe serialization.||Designed spatial reasoning heuristics: perspective-aware movement analysis and motion-based depth calibration.||Built the Flask API and the entire vanilla JS frontend — Web Speech API, gyroscope correction, voice commands.',
      outcome: '25–40× speedup over the initial CPU prototype (1–3 FPS CPU -> 10–16 FPS GPU with TensorRT). 60–100ms total end-to-end latency on GPU. Manually collected and annotated dataset of 4,226 images expanded to 21,126 via augmentation with YOLO OBB annotations. 43 bugs resolved (13 critical, 17 high, 13 medium) across coordinate systems, threading, CUDA/TensorRT, stale data, and navigation logic. Demonstrated live as assistive AI research at VIT with all three demo scenarios.',
      stat: '16 FPS', statLabel: 'GPU inference', statCount: '16', statSuffix: ' FPS',
      stat2: '60ms', stat2Label: 'end-to-end latency',
      demo: 'https://youtu.be/nBjYTFXBpWY,https://youtu.be/QXU4xU__s2Y,https://youtu.be/PZpLDPnhvVg',
    },
  },
  {
    id: 'FILE-011', cat: 'access',
    ariaLabel: 'ASL Transcription System: Real-time sign language recognition. Press Enter to view details.',
    codename: 'ASL Transcription', domain: 'Accessibility · CV', metric: '96% mAP',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'ASL Transcription System',
      badge: 'Accessibility - Deep Learning - Computer Vision', role: 'Lead Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Real-time ASL fingerspelling recognition — single-stage detection and classification via YOLOv11x.||Browser-native: WebRTC camera input -> Flask API backend.||Recognizes 26 letters + SPACE and DELETE for live text composition.',
      architecture: 'Stack: YOLOv11x (56.8M params, 194.6 GFLOPs) + Flask + WebRTC||Fine-tuned on 2,614 augmented ASL images. Inference at 640×640, conf=0.25, IoU=0.45.||Dual-mode async pipeline: frame submission at 500ms, prediction polling at 200ms — decoupled to prevent blocking.||2s debounce + 40% confidence gating prevents duplicate character accumulation.',
      contribution: 'Ablation study across YOLOv8L, YOLOv8X, and YOLOv11x — YOLOv11x won (better FLOPs/param ratio, no overfitting).||Built the full-stack pipeline: WebRTC frontend, Flask inference API, and state-based word/sentence logic.',
      outcome: '96% mAP@0.5, 95% precision, 97% recall on ASL letter detection. Converges in ~50 epochs vs 200 for CNN-LSTM approaches. Matches YOLOv8 accuracy with a more efficient architecture.',
      stat: '96%', statLabel: 'mAP@0.5', statCount: '96', statSuffix: '%',
      stat2: '97%', stat2Label: 'recall',
    },
  },
  {
    id: 'FILE-012', cat: 'hack',
    ariaLabel: 'Plant Disease and Pest Detection: YOLOv8-seg and YOLO11n with TabNet fusion. Press Enter to view details.',
    codename: 'Plant Disease Detection', domain: 'Hackathon · CV', metric: '99.97%',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Plant Disease & Pest Detection',
      badge: 'Hackathon', role: 'Fullstack & CV Dev', status: 'COMPLETE', unredacted: true,
      overview: 'Multimodal AI for Indian sugarcane farming — fuses computer vision with structured questionnaire data.||YOLOv8s-seg for dead heart disease (99.5% mAP@0.5); YOLO11n for tiller damage pest detection (99.4% mAP@0.5).||Fusion layer: 99.97% accuracy, 67% error reduction over questionnaire-only baseline.||Field-validated across 500 farmers in 5 Indian states.',
      architecture: 'Stack: YOLOv8s-seg + YOLO11n + TabNet + Flask + mobile JS frontend||YOLOv8s-seg: 0.942 mean IoU, 0.968 Dice score for dead heart instance segmentation.||YOLO11n: 3M params, 6.2MB, 12.3ms GPU inference for tiller damage detection.||TabNet: attention-based model on structured farmer questionnaires (~96% accuracy). Fusion layer combines vision + questionnaire confidence scores.',
      contribution: 'Trained YOLOv8s-seg, YOLO11n, and TabNet models.||Built the frontend UI and assisted with backend development. 5-person team.',
      outcome: 'Hackathon submission. 99.97% fused model accuracy. 89.3% early detection rate before visible symptoms. Validated by 500 farmers across 5 states with 94.2% farmer agreement and 97.8% expert verification.',
      stat: '99.97%', statLabel: 'fusion accuracy',
      stat2: '89.3%', stat2Label: 'early detection rate',
      github: 'https://github.com/zParik/CodeCultivators---Agrithon',
    },
  },
  {
    id: 'FILE-013', cat: 'hack',
    ariaLabel: 'Uni P2P Rental Marketplace: React + Supabase rental platform, awarded Best UI/UX. Press Enter to view details.',
    codename: 'P2P Rental Marketplace', domain: 'Hackathon', metric: 'Best UI/UX',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Uni P2P Rental Marketplace',
      badge: 'Hackathon - Best UI/UX', role: 'Team Lead & Full-Stack Developer', status: 'COMPLETE', unredacted: true,
      overview: 'University peer-to-peer rental marketplace where students list and rent items from each other. Built pre-AI at a hackathon. Led a 3-person team: two full-stack devs (me and Chetak) and a dedicated UI/UX designer (Aayush, Figma). Awarded Best UI/UX.',
      architecture: 'Stack: React 18 + Vite + Redux Toolkit + Supabase (Postgres + auth + storage) + CSS Modules||Redux slices: auth and product state. Supabase handles auth, DB, and file storage.||Pages: landing, listings, product detail, cart, rentals, KYC, account management, create listing.',
      contribution: 'Team lead and full-stack developer alongside Chetak. Owned the frontend architecture, Redux store design, Supabase integration, and core pages. Aayush handled Figma design; we implemented it.',
      outcome: 'Awarded Best UI/UX at the hackathon. Built entirely without AI assistance.',
      stat: 'Best UI/UX', statLabel: 'hackathon award',
      stat2: 'Built', stat2Label: 'without AI assistance',
      github: 'https://github.com/zParik/Devjams',
    },
  },
  {
    id: 'FILE-014', cat: 'sys',
    ariaLabel: 'Tic-Tac-Toe Minimax AI: Unbeatable AI via plain Minimax. Press Enter to view details.',
    codename: 'Minimax AI', domain: 'AI · Web', metric: '255K nodes',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Tic-Tac-Toe: Minimax AI',
      badge: 'AI - Web', role: 'Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Browser-based Tic-Tac-Toe with an unbeatable AI opponent powered by plain Minimax. Personal project built to explore Flask and game-tree search.',
      architecture: 'Stack: Flask + Vanilla JS + jQuery||Flask API: /getmethod/ receives board state, runs Minimax over full 9-ply game tree, returns optimal move as JSON.||Frontend manages board state and renders moves client-side.',
      contribution: 'Implemented the Minimax algorithm from scratch. Built all Flask routes, the board encoding/decoding logic, and the interactive JS frontend.',
      outcome: 'Personal project. Provably unbeatable: evaluates 255,168 nodes per opening move.',
      stat: '255K', statLabel: 'nodes per move', statCount: '255', statSuffix: 'K',
      stat2: 'Provably', stat2Label: 'unbeatable',
      github: 'https://github.com/zParik/Python-Project-Red/tree/main/Maasive%20website%20prj',
    },
  },
  {
    id: 'FILE-015', cat: 'sys',
    ariaLabel: 'Ashram Management Portal: PHP/MySQL portal with room bookings, course enrollment, and staff dashboard. Press Enter to view details.',
    codename: 'Ashram Management', domain: 'Web', metric: '3 Roles',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Ashram Management Portal',
      badge: 'Web', role: 'Full-Stack Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Full-stack web app for a wellness ashram. Public visitors can book rooms and enroll in courses; staff get an internal dashboard with participant management and attendance tracking.',
      architecture: 'Stack: PHP + PDO/MySQL + Vanilla JS||Session-based auth with 3 roles: user / employee / admin.||REST-style endpoints: room bookings (availability stored proc), course enrollment, participant CRUD, attendance.||\'.htaccess routes all protected pages through a central guard.',
      contribution: 'Sole developer. Designed the database schema, built all PHP API endpoints, implemented role-based access control, and built the frontend from scratch.',
      outcome: 'Submitted as a university web development course project.',
      stat: '3 Roles', statLabel: 'access levels', statCount: '3', statSuffix: ' Roles',
      stat2: 'REST', stat2Label: 'API design',
      github: 'https://github.com/zParik/refactored-fortnight',
    },
  },
  {
    id: 'FILE-016', cat: 'hack',
    ariaLabel: 'GapEdit: C terminal gap-buffer editor. Press Enter to view details.',
    codename: 'GapEdit', domain: 'Codeathon · C', metric: '8 hrs build',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'GapEdit',
      badge: 'Codeathon - Systems', role: 'Systems Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Gap-buffer text editor written in C. Handles cursor movement, insert, and delete operations via a two-stack structure.',
      architecture: 'Gap buffer implemented as two character stacks (left/right of cursor). Supports text insertion, deletion, and cursor movement in both directions.',
      contribution: 'Sole author. Implemented the gap buffer, cursor operations, and a menu-driven CLI interface.',
      outcome: 'Built at a codeathon in ~8 hours. Reviewer recognized it as a functional CLI editor and suggested polishing it further.',
      stat: '8 hrs', statLabel: 'codeathon build',
      stat2: 'Gap Buffer', stat2Label: 'in pure C',
    },
  },
  {
    id: 'FILE-017', cat: 'hack',
    ariaLabel: 'SWITCHBOARD: Networking hackathon: Cisco Packet Tracer topology and concurrent Java socket server. Press Enter to view details.',
    codename: 'SWITCHBOARD', domain: 'Hackathon', metric: 'Top 3',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'SWITCHBOARD',
      badge: 'Hackathon - Networking & IPC', role: 'Team Lead & Sole Socket Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Networking hackathon (Nov 2024): Cisco Packet Tracer enterprise network + concurrent Java socket bank — two parallel tracks.||Packet Tracer: online education platform with AWS cluster, MongoDB servers, ACL-segmented HQ network.||Socket track: live multi-client bank — clients credit/debit each other in real time with consistent shared state.||Top 3 teams; selected to present to external evaluator.',
      architecture: 'Stack: Java sockets + Cisco Packet Tracer (ACL subnetting + core router backbone)||Packet Tracer: 4 ACL-segmented departments (R&D, IT, HR, Dev) — 64 IPs each, strict per-department access policies.||Socket server: dual HashMaps (username -> PrintWriter for routing; username -> balance for state). Each client spawns a ClientHandler thread.||Clients run async MessageReceiver thread — server pushes don\'t block user input. Active client list broadcast after every transaction.',
      contribution: 'Team lead across both tracks.||Sole architect and developer of the Java socket server: concurrent client handling, hashmap routing, balance state, async receiver.||Directed the Packet Tracer topology; Megha and Chetak handled Cisco configuration.',
      outcome: 'Top 3 out of all competing teams, selected to present to the external evaluator. Demonstrated 4 simultaneous clients performing concurrent transactions with consistent shared state: no race conditions, no dropped messages.',
      stat: 'Top 3', statLabel: 'hackathon placement',
      stat2: '4 clients', stat2Label: 'concurrent, zero races',
      github: 'https://github.com/zParik/College-Code-Stuff',
    },
  },
  {
    id: 'FILE-018', cat: 'sys',
    ariaLabel: 'Linux Tutorial Blog: AI-assisted technical blog on Linux fundamentals. Press Enter to view details.',
    codename: 'Linux Tutorial Blog', domain: 'Technical Writing', metric: 'Published',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Linux Tutorial Blog',
      badge: 'Technical Writing', role: 'Author', status: 'COMPLETE', unredacted: true,
      overview: 'AI-assisted technical blog covering Linux fundamentals, built as an educational resource for a club event introducing students to the Linux ecosystem.',
      architecture: 'Static blog site generated with AI tooling. Content covers core Linux concepts: terminal basics, file system navigation, package management, and shell scripting, structured as progressive tutorials.',
      contribution: 'Authored all tutorial content and structured the learning progression. Used AI tooling to accelerate site generation while curating the technical material.',
      outcome: 'Delivered as part of a club event. Served as a hands-on reference for attendees learning Linux for the first time.',
      stat: 'Published', statLabel: 'club event resource',
      stat2: 'Linux', stat2Label: 'fundamentals',
      github: 'https://github.com/zParik/Scribble-AI-blog',
    },
  },
  {
    id: 'FILE-019', cat: 'sys', earlier: true,
    ariaLabel: 'Python Practice Launcher: Tkinter app with 29 exercises. Press Enter to view details.',
    codename: 'Python Practice Launcher', domain: 'High School', metric: '29 exercises',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Python Practice Launcher',
      badge: 'High School', role: 'Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Built a Tkinter desktop app to help classmates learn Python: a menu-driven launcher with 29 exercises covering sorting, searching, recursion, and data structures. Iterated through 4 versions: plain CLI, refactored with functions, Tkinter GUI, and a Django web port.',
      architecture: 'Stack: Python + Tkinter + Django (web port) + Numba||3 modules: File1.py (exercise source strings), Python.py (29 runnable functions), KeyIndexAssigner.py (functools.partial dispatch registry).||Final version: all 29 functions decorated with Numba @jit(nopython=True). Deeply unnecessary. Completely intentional.',
      contribution: 'Sole developer. Designed the modular architecture and progressively iterated the interface across 4 versions. FastStartup variant auto-launched Google Meet links for online classes.',
      outcome: 'Used informally by ~15 classmates during high school. The origin of this portfolio: the first project that felt genuinely useful.',
      stat: '29 exercises', statLabel: 'Python problems',
      stat2: '4 versions', stat2Label: 'iterated',
    },
  },
  {
    id: 'FILE-020', cat: 'sys', earlier: true,
    ariaLabel: 'Faculty Substitution Manager: Django web app automating sub assignment. Press Enter to view details.',
    codename: 'Faculty Substitution Manager', domain: 'High School', metric: 'Deployed',
    dossier: {
      clearance: 'DECLASSIFIED', name: 'Faculty Substitution Manager',
      badge: 'High School', role: 'Full-Stack Developer', status: 'COMPLETE', unredacted: true,
      overview: 'Built a Django web app during high school to automate faculty absence tracking and substitute assignment. Admin marks absent teachers; the system cross-references timetables for 6 classes across 5 days and auto-assigns available subs with a cap of 2 periods each.',
      architecture: 'Stack: Django + MongoDB (djongo) + custom greedy scheduler||Models: teachers (name, subject, attendance, sub count), per-teacher weekly schedules (Teach2), daily reports.||Greedy algorithm checks availability, current load cap, and subject-class conflicts before assigning subs.||Reports saved to disk and tracked in DB per session.',
      contribution: 'Sole developer. Designed the data model, the substitution algorithm, and the Django views end-to-end. Also built the timetable config layer (tables.py) for all 6 classes.',
      outcome: 'Deployed and actively used at school. Automated a manual coordination task that previously required admin overhead every morning. Daily reports generated and archived per session.',
      stat: 'Deployed', statLabel: 'used at school',
      stat2: 'Greedy', stat2Label: 'scheduler algorithm',
    },
  },
];

function renderManifest() {
  const list = document.getElementById('manifest-list');
  const earlierList = document.getElementById('earlier-work-list');

  PROJECTS.forEach(p => {
    const el = document.createElement('div');
    const classes = ['manifest-row', 'dossier-trigger', `cat-${p.cat}`];
    if (p.active) classes.push('manifest-row--active');
    if (!p.earlier) classes.push('reveal');
    el.className = classes.join(' ');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', p.ariaLabel);

    const d = p.dossier;
    el.dataset.dossierUnredacted = String(d.unredacted !== false);
    el.dataset.dossierClearance = d.clearance;
    el.dataset.dossierName = d.name;
    el.dataset.dossierBadge = d.badge;
    el.dataset.dossierRole = d.role;
    el.dataset.dossierStatus = d.status;
    el.dataset.dossierOverview = d.overview;
    el.dataset.dossierArchitecture = d.architecture;
    el.dataset.dossierContribution = d.contribution;
    el.dataset.dossierOutcome = d.outcome;
    if (d.stat) el.dataset.dossierStat = d.stat;
    if (d.statLabel) el.dataset.dossierStatLabel = d.statLabel;
    if (d.statCount) el.dataset.dossierStatCount = d.statCount;
    if (d.statSuffix !== undefined) el.dataset.dossierStatSuffix = d.statSuffix;
    if (d.stat2) el.dataset.dossierStat2 = d.stat2;
    if (d.stat2Label) el.dataset.dossierStat2Label = d.stat2Label;
    if (d.github) el.dataset.dossierGithub = d.github;
    if (d.link) el.dataset.dossierLink = d.link;
    if (d.demo) el.dataset.dossierDemo = d.demo;

    if (p.active) {
      el.innerHTML =
        `<span class="manifest-active-dot" aria-hidden="true"></span>` +
        `<span class="manifest-filenum">${escHtml(p.id)}</span>` +
        `<span class="manifest-codename">${escHtml(p.codename)}</span>` +
        `<span class="manifest-domain">${escHtml(p.domain)}</span>` +
        `<span class="manifest-metric">${escHtml(p.metric)}</span>` +
        `<span class="manifest-status-tag manifest-status-tag--active">ACTIVE</span>`;
    } else {
      el.innerHTML =
        `<span class="manifest-arrow" aria-hidden="true">▶</span>` +
        `<span class="manifest-filenum">${escHtml(p.id)}</span>` +
        `<span class="manifest-codename">${escHtml(p.codename)}</span>` +
        `<span class="manifest-domain">${escHtml(p.domain)}</span>` +
        `<span class="manifest-metric">${escHtml(p.metric)}</span>` +
        `<span class="manifest-status-tag">COMPLETE</span>`;
    }

    (p.earlier ? earlierList : list).appendChild(el);
  });
}

if (document.getElementById('manifest-list')) {
  renderManifest();
  if (!prefersReducedMotion) document.body.setAttribute('data-boot', 'running');
}
