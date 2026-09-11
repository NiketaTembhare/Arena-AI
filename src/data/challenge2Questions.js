// Challenge 2: DECODE THE TECH Question Bank (30 technical concept puzzles)

export const CHALLENGE_2_QUESTIONS = [
  // EASY
  {
    id: "c2_01",
    difficulty: "Easy",
    clues: ["☁️", "💻", "🌐"],
    clueLabels: ["Cloud", "Computer", "Global Network"],
    question: "What core IT foundation is represented by these visual clues?",
    options: ["Cloud Computing", "Computer Vision", "Blockchain", "Data Mining"],
    answer: "Cloud Computing",
    explanation: "Cloud Computing delivers computing services (servers, storage, networking) over the Internet ('the cloud')."
  },
  {
    id: "c2_02",
    difficulty: "Easy",
    clues: ["🔐", "👤", "🎫"],
    clueLabels: ["Lock", "User Profile", "Access Badge"],
    question: "Identify the security process represented by these visual symbols:",
    options: ["Authentication", "Machine Learning", "API Gateway", "Compiling"],
    answer: "Authentication",
    explanation: "Authentication verifies a user's digital identity using credentials, tokens, or security keys before granting system access."
  },
  {
    id: "c2_03",
    difficulty: "Easy",
    clues: ["👁️", "📷", "🤖"],
    clueLabels: ["Eye Inspection", "Camera Lens", "AI Robot"],
    question: "Which AI field enables machines to interpret visual imagery?",
    options: ["Computer Vision", "Natural Language Processing", "Quantum Computing", "Database Sharding"],
    answer: "Computer Vision",
    explanation: "Computer Vision is the AI domain that trains algorithms to acquire, process, analyze, and understand digital images/videos."
  },
  {
    id: "c2_04",
    difficulty: "Easy",
    clues: ["📦", "🚢", "⚡"],
    clueLabels: ["Software Package", "Cargo Container", "Fast Execution"],
    question: "What DevOps virtualization technology is depicted here?",
    options: ["Containerization (Docker)", "Quantum Tunneling", "Mainframe Hosting", "Data Warehousing"],
    answer: "Containerization (Docker)",
    explanation: "Containerization packages code and dependencies together so applications run quickly and reliably across computing environments."
  },
  {
    id: "c2_05",
    difficulty: "Easy/Medium",
    clues: ["🧠", "🔍", "📚", "🤖"],
    clueLabels: ["Neural LLM", "Vector Search", "Knowledge Base", "AI Generator"],
    question: "What architecture grounds LLMs with external enterprise data?",
    options: ["RAG (Retrieval-Augmented Gen)", "SQL Relational DB", "CDN Edge Cache", "Compiler Optimization"],
    answer: "RAG (Retrieval-Augmented Gen)",
    explanation: "RAG (Retrieval-Augmented Generation) combines vector information retrieval with generative LLMs to eliminate hallucinations."
  },
  {
    id: "c2_06",
    difficulty: "Easy/Medium",
    clues: ["🤖", "🤖", "🤝", "🔄"],
    clueLabels: ["Agent A", "Agent B", "Collaboration", "Autonomous Loop"],
    question: "Identify the emerging AI paradigm involving multiple collaborative AI workers:",
    options: ["Multi-Agent System", "Monolithic Database", "Domain Name System", "Symmetric Encryption"],
    answer: "Multi-Agent System",
    explanation: "Multi-Agent Systems coordinate multiple specialized AI agents working together to solve complex end-to-end tasks."
  },
  {
    id: "c2_07",
    difficulty: "Medium",
    clues: ["📊", "🧭", "📐", "🎯"],
    clueLabels: ["High Dimension", "Embedding Space", "Cosine Distance", "Match Target"],
    question: "What specialized data store powers fast semantic similarity searches?",
    options: ["Vector Database", "Key-Value Store", "Excel Spreadsheet", "Network Firewall"],
    answer: "Vector Database",
    explanation: "Vector Databases index high-dimensional mathematical embeddings to find semantically similar items in milliseconds."
  },
  {
    id: "c2_08",
    difficulty: "Medium",
    clues: ["🎯", "✍️", "⚙️", "💬"],
    clueLabels: ["Target Persona", "Context Prompt", "Parameter Tuning", "LLM Output"],
    question: "What discipline crafts structured inputs to guide LLM behavior?",
    options: ["Prompt Engineering", "Assembly Coding", "Hard Drive Formatting", "Cable Management"],
    answer: "Prompt Engineering",
    explanation: "Prompt Engineering is the practice of designing, refining, and structuring prompts to produce optimal responses from AI models."
  },
  {
    id: "c2_09",
    difficulty: "Medium",
    clues: ["🎯", "🏋️", "📚", "🧠"],
    clueLabels: ["Domain Spec", "Weight Adjustments", "Domain Dataset", "Specialized Model"],
    question: "What process adapts a pre-trained base LLM to specific domain tasks?",
    options: ["Fine-Tuning", "Data Compression", "Optical Character Recognition", "Load Balancing"],
    answer: "Fine-Tuning",
    explanation: "Fine-tuning updates a pre-trained AI model's internal weights on specialized domain datasets for higher accuracy."
  },
  {
    id: "c2_10",
    difficulty: "Medium",
    clues: ["🌉", "🔌", "↔️", "📡"],
    clueLabels: ["API Gateway", "Protocol Plugin", "Request/Response", "Microservice"],
    question: "What interface allows software systems to talk to each other securely?",
    options: ["API Gateway", "GPU Kernel", "Optical Fiber", "Subnet Mask"],
    answer: "API Gateway",
    explanation: "An API (Application Programming Interface) Gateway manages traffic, security, and protocol translation between clients and services."
  },
  {
    id: "c2_11",
    difficulty: "Hard",
    clues: ["🔗", "🧊", "🔐", "🧱"],
    clueLabels: ["Cryptographic Hash", "Immutable Block", "Encrypted Ledger", "Chain Link"],
    question: "Decode this decentralized immutable ledger technology:",
    options: ["Blockchain", "Neural Network", "Redis Cache", "Apache Kafka"],
    answer: "Blockchain",
    explanation: "Blockchain is a decentralized distributed ledger that cryptographically links blocks of data chronologically."
  },
  {
    id: "c2_12",
    difficulty: "Hard",
    clues: ["⚡", "📶", "📡", "⏱️"],
    clueLabels: ["Ultra-Low Latency", "Local Gateway", "Cellular Tower", "Real-Time"],
    question: "What computing paradigm processes data close to the physical device?",
    options: ["Edge Computing", "Mainframe Batch Processing", "Cold Storage", "DNS Propagation"],
    answer: "Edge Computing",
    explanation: "Edge Computing moves data processing and AI inference closer to sensors/devices to minimize network latency."
  },
  {
    id: "c2_13",
    difficulty: "Hard",
    clues: ["🔮", "💬", "❌", "🌀"],
    clueLabels: ["Plausible Sounding", "Generated Text", "Factually False", "Confabulation"],
    question: "What AI phenomenon causes LLMs to state false information confidently?",
    options: ["Hallucination", "Overfitting", "Data Drift", "Quantization"],
    answer: "Hallucination",
    explanation: "AI Hallucination occurs when a generative model outputs plausible-sounding text that is factually incorrect or ungrounded."
  },
  {
    id: "c2_14",
    difficulty: "Hard",
    clues: ["📐", "📉", "🗜️", "🚀"],
    clueLabels: ["FP32 Precision", "Compress to INT8", "Reduced Footprint", "Faster Inference"],
    question: "What model optimization shrinks AI weights from 32-bit floats to smaller integers?",
    options: ["Quantization", "Retrieval", "Tokenization", "Normalization"],
    answer: "Quantization",
    explanation: "Quantization converts model weights and activations from high-precision floats (FP32/FP16) to lower precision (INT8/INT4)."
  },
  {
    id: "c2_15",
    difficulty: "Very Hard",
    clues: ["🧠", "🎮", "🍪", "🏆"],
    clueLabels: ["Agent Policy", "Environment State", "Action Reward", "Optimal Strategy"],
    question: "What machine learning paradigm trains models using rewards and penalties?",
    options: ["Reinforcement Learning (RLHF)", "Unsupervised Clustering", "Static Rule Engine", "Linear Regression"],
    answer: "Reinforcement Learning (RLHF)",
    explanation: "Reinforcement Learning trains AI agents to make sequences of decisions by maximizing cumulative rewards in an environment."
  },
  {
    id: "c2_16",
    difficulty: "Very Hard",
    clues: ["🤖", "🛠️", "⚙️", "JSON"],
    clueLabels: ["AI Agent", "Tool Execution", "Function Call", "Structured Schema"],
    question: "What LLM capability permits an AI to execute external code tools via JSON schema?",
    options: ["Function Calling / Tool Use", "Prompt Injection", "Gradient Descent", "Cross-Validation"],
    answer: "Function Calling / Tool Use",
    explanation: "Function Calling allows an LLM to recognize when it needs to call external APIs/tools and output structured JSON payload parameters."
  },
  {
    id: "c2_17",
    difficulty: "Very Hard",
    clues: ["🪞", "🧬", "📊", "🤖"],
    clueLabels: ["Model Generator", "Artificial Distribution", "Privacy Preserved", "Synthetic Data"],
    question: "What artificially generated data category protects privacy during AI training?",
    options: ["Synthetic Data", "Scraped Web Data", "Dark Data", "Legacy Flat Files"],
    answer: "Synthetic Data",
    explanation: "Synthetic Data is artificially created data generated by algorithms that mirrors real-world data distributions without exposing real user PII."
  },
  {
    id: "c2_18",
    difficulty: "Very Hard",
    clues: ["🌐", "🕸️", "🏷️", "💡"],
    clueLabels: ["Entities", "Relationship Edges", "Ontology Node", "Semantic Reasoning"],
    question: "What graph structure represents interlinked real-world concepts for enterprise AI?",
    options: ["Knowledge Graph", "Binary Search Tree", "Hash Table", "Stack Trace"],
    answer: "Knowledge Graph",
    explanation: "A Knowledge Graph stores real-world entities and their interconnected semantic relationships in a graph node-and-edge network."
  },
  {
    id: "c2_19",
    difficulty: "Medium",
    clues: ["🔁", "🔄", "🧪", "🚀"],
    clueLabels: ["Code Commit", "Automated Build", "Unit Testing", "Cloud Deployment"],
    question: "What software methodology automates testing and deployment pipelines?",
    options: ["CI/CD Pipeline", "Waterfall Model", "Manual FTP Upload", "Penetration Testing"],
    answer: "CI/CD Pipeline",
    explanation: "Continuous Integration & Continuous Deployment (CI/CD) automates software building, testing, and cloud deployment."
  },
  {
    id: "c2_20",
    difficulty: "Hard",
    clues: ["🧠", "⚡", "Attention", "🔑"],
    clueLabels: ["Self-Attention", "Parallel Compute", "Transformer Block", "Decoder"],
    question: "What revolutionary deep learning architecture introduced 'Self-Attention' in 2017?",
    options: ["Transformer", "Convolutional Neural Net", "Recurrent Neural Net", "Decision Tree"],
    answer: "Transformer",
    explanation: "The Transformer architecture ('Attention Is All You Need') revolutionized AI by processing sequence tokens in parallel via self-attention."
  },
  {
    id: "c2_21",
    difficulty: "Easy",
    clues: ["🤖", "🎨", "🖼️"],
    clueLabels: ["Generative AI", "Artistic Creation", "Diffusion Image"],
    question: "Which technology field creates brand new content like text, images, and audio?",
    options: ["Generative AI", "Disk Defragmentation", "Data Scrubbing", "Form Validation"],
    answer: "Generative AI",
    explanation: "Generative AI refers to algorithms (like Diffusion and Transformers) capable of creating new original media content."
  },
  {
    id: "c2_22",
    difficulty: "Medium",
    clues: ["🕵️", "💉", "💬", "⚠️"],
    clueLabels: ["Attacker", "Malicious Injection", "Prompt Context", "Security Bypass"],
    question: "What security vulnerability tricks an LLM into ignoring system guardrails?",
    options: ["Prompt Injection", "SQL Injection", "Cross-Site Scripting", "Buffer Overflow"],
    answer: "Prompt Injection",
    explanation: "Prompt Injection occurs when adversarial user input overrides pre-defined system prompts or safety guardrails."
  },
  {
    id: "c2_23",
    difficulty: "Hard",
    clues: ["0️⃣", "🎯", "🧠", "✨"],
    clueLabels: ["Zero Examples", "Direct Task Prompt", "General Reasoning", "Instant Result"],
    question: "What learning capability enables LLMs to perform unseen tasks without prior examples?",
    options: ["Zero-Shot Learning", "Few-Shot Fine-Tuning", "Supervised Training", "Transfer Learning"],
    answer: "Zero-Shot Learning",
    explanation: "Zero-Shot Learning is the ability of a pre-trained model to classify or solve tasks without having seen explicit training examples."
  },
  {
    id: "c2_24",
    difficulty: "Very Hard",
    clues: ["⚖️", "📊", "🙈", "🚨"],
    clueLabels: ["Unbalanced Data", "Skewed Output", "Demographic Blindspot", "Algorithmic Harm"],
    question: "What AI ethics issue occurs when models produce systematically prejudiced outputs?",
    options: ["Algorithmic Bias", "Model Drift", "Hardware Throttling", "Network Jitter"],
    answer: "Algorithmic Bias",
    explanation: "Algorithmic Bias happens when an AI model perpetuates historical prejudice or systemic unfairness present in training data."
  },
  {
    id: "c2_25",
    difficulty: "Medium",
    clues: ["🧱", "🧩", "⚙️", "🔌"],
    clueLabels: ["Decomposed Services", "Independent Deploy", "REST Communication", "Distributed System"],
    question: "What architecture structures applications as a collection of small, independent services?",
    options: ["Microservices", "Monolith", "Mainframe", "Serverless Function"],
    answer: "Microservices",
    explanation: "Microservices architecture breaks down applications into small, loosely-coupled, independently deployable services."
  },
  {
    id: "c2_26",
    difficulty: "Hard",
    clues: ["📉", "🧠", "⏳", "⚠️"],
    clueLabels: ["Accuracy Drop", "Concept Shift", "Outdated Model", "Re-training Needed"],
    question: "What machine learning phenomenon describes degraded performance over time as real-world data changes?",
    options: ["Model Drift", "Vanishing Gradient", "Catastrophic Forgetting", "Underfitting"],
    answer: "Model Drift",
    explanation: "Model Drift (or Concept Drift) occurs when real-world data patterns change over time, rendering the trained model obsolete."
  },
  {
    id: "c2_27",
    difficulty: "Very Hard",
    clues: ["🔒", "🤝", "🧠", "🌐"],
    clueLabels: ["Encrypted Devices", "Local Model Training", "Global Aggregation", "Privacy First"],
    question: "What ML paradigm trains models across decentralized edge devices without sharing raw data?",
    options: ["Federated Learning", "Centralized Mining", "Web Scraping", "Data Mirroring"],
    answer: "Federated Learning",
    explanation: "Federated Learning trains algorithms across decentralized edge devices holding local data samples without exchanging raw user data."
  },
  {
    id: "c2_28",
    difficulty: "Easy",
    clues: ["🏷️", "📥", "🤖", "✅"],
    clueLabels: ["Annotated Data", "Feature Vector", "Target Label", "Supervised Task"],
    question: "What traditional ML category relies on paired input-output labeled datasets?",
    options: ["Supervised Learning", "Unsupervised Clustering", "Generative Art", "Brute Force"],
    answer: "Supervised Learning",
    explanation: "Supervised Learning algorithms learn mapping functions between input features and target ground-truth output labels."
  },
  {
    id: "c2_29",
    difficulty: "Hard",
    clues: ["💬", "✂️", "🔢", "🧠"],
    clueLabels: ["Raw Text String", "Tokenizer Subword", "Token IDs", "LLM Context Window"],
    question: "What preprocessing step converts raw text into numerical subword chunks for LLMs?",
    options: ["Tokenization", "Stemming", "Encryption", "Parsing"],
    answer: "Tokenization",
    explanation: "Tokenization breaks input text into smaller subword units (tokens) and maps them to numerical IDs for neural processing."
  },
  {
    id: "c2_30",
    difficulty: "Very Hard",
    clues: ["🪞", "🛡️", "🤖", "👥"],
    clueLabels: ["System Persona", "Guardrail Rules", "Safety Alignment", "Responsible AI"],
    question: "What alignment technique uses human preference ratings to make LLMs helpful and harmless?",
    options: ["RLHF (Reinforcement Learning from Human Feedback)", "K-Means Clustering", "Backpropagation", "Grid Search"],
    answer: "RLHF (Reinforcement Learning from Human Feedback)",
    explanation: "RLHF fine-tunes models using human preference rankings to align AI behavior with safety, accuracy, and human intent."
  }
];
