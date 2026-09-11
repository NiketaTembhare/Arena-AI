-- ==========================================================
-- AI ARENA — CLEAN RESET DATABASE SCHEMA & SEED DATA
-- ==========================================================

-- 1. DROP EXISTING TABLES & VIEWS
DROP VIEW IF EXISTS room_leaderboard CASCADE;
DROP TABLE IF EXISTS room_answers CASCADE;
DROP TABLE IF EXISTS room_round_questions CASCADE;
DROP TABLE IF EXISTS room_players CASCADE;
DROP TABLE IF EXISTS game_rooms CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- 2. QUESTIONS TABLE
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round int NOT NULL CHECK (round IN (1, 2, 3)),
  question_type text NOT NULL CHECK (question_type IN ('image_comparison', 'logo_mcq', 'emoji_mcq')),
  prompt_text text,                  -- question text or emoji clue
  real_image_url text,               -- round 1 real photo static path
  ai_image_url text,                 -- round 1 AI synthetic photo static path
  logo_url text,                     -- round 2 logo URL static path
  options jsonb,                     -- array of 4 strings for round 2 & 3
  correct_option text,               -- matches one option string for round 2 & 3
  explanation text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. GAME ROOMS TABLE
CREATE TABLE game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code varchar(10) UNIQUE NOT NULL,
  host_id text,
  status text CHECK (status IN (
    'lobby',
    'round1', 'round1_results',
    'round2', 'round2_results',
    'round3', 'round3_results',
    'final_results'
  )) DEFAULT 'lobby',
  current_round int DEFAULT 0,
  round_started_at timestamptz,
  round_duration_seconds int DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- 4. ROOM PLAYERS TABLE
CREATE TABLE room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  device_token text NOT NULL,
  has_completed_session boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, device_token)
);

-- 5. ROOM ROUND QUESTIONS TABLE (PER PLAYER QUESTION SAMPLING)
CREATE TABLE room_round_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES room_players(id) ON DELETE CASCADE,
  round int NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  position int NOT NULL,
  UNIQUE(room_id, player_id, round, position)
);

-- 6. ROOM ANSWERS TABLE
CREATE TABLE room_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES room_players(id) ON DELETE CASCADE,
  round int NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  selected_option text,
  is_correct boolean NOT NULL,
  points_earned int DEFAULT 0,
  response_time_ms int,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(room_id, player_id, round, question_id)
);

-- 7. ROOM LEADERBOARD VIEW
CREATE OR REPLACE VIEW room_leaderboard AS
SELECT 
  rp.room_id,
  rp.id AS player_id,
  rp.display_name,
  COALESCE(SUM(ra.points_earned), 0) AS total_score,
  COALESCE(SUM(CASE WHEN ra.round = 1 THEN ra.points_earned ELSE 0 END), 0) AS round1_score,
  COALESCE(SUM(CASE WHEN ra.round = 2 THEN ra.points_earned ELSE 0 END), 0) AS round2_score,
  COALESCE(SUM(CASE WHEN ra.round = 3 THEN ra.points_earned ELSE 0 END), 0) AS round3_score,
  COALESCE(COUNT(CASE WHEN ra.is_correct = true THEN 1 END), 0) AS total_correct,
  COALESCE(COUNT(ra.id), 0) AS total_answered
FROM room_players rp
LEFT JOIN room_answers ra ON rp.id = ra.player_id AND rp.room_id = ra.room_id
GROUP BY rp.room_id, rp.id, rp.display_name;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES (PERMISSIVE ANON BOOTH ACCESS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_round_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public full access to game_rooms" ON game_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_players" ON room_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_round_questions" ON room_round_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_answers" ON room_answers FOR ALL USING (true) WITH CHECK (true);

-- 9. SUPABASE REALTIME PUBLICATION SETUP
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE game_rooms, room_players, room_answers;

-- 10. SEED DATA (20 QUESTIONS PER ROUND = 60 TOTAL)

-- ROUND 1 SEED (20 Image Comparison Questions: real_image_url vs ai_image_url)
INSERT INTO questions (round, question_type, prompt_text, real_image_url, ai_image_url, explanation) VALUES
(1, 'image_comparison', 'Which portrait is AI-generated?', '/images/round1/q01_real.jpg', '/images/round1/q01_ai.jpg', 'The AI portrait shows pupil reflection asymmetry.'),
(1, 'image_comparison', 'Spot the AI-synthesized architectural render:', '/images/round1/q02_real.jpg', '/images/round1/q02_ai.jpg', 'The AI image contains non-physical perspective distortions.'),
(1, 'image_comparison', 'Which futuristic landscape was generated by AI?', '/images/round1/q03_real.jpg', '/images/round1/q03_ai.jpg', 'The AI landscape uses synthetic diffusion brushwork.'),
(1, 'image_comparison', 'Which animal photo is computer-generated?', '/images/round1/q04_real.jpg', '/images/round1/q04_ai.jpg', 'The AI animal photo has synthetic fur texture blurring.'),
(1, 'image_comparison', 'Identify the AI-rendered gourmet dish:', '/images/round1/q05_real.jpg', '/images/round1/q05_ai.jpg', 'The AI dish features unrealistic specular reflections on garnish.'),
(1, 'image_comparison', 'Which neon cyberpunk street is AI art?', '/images/round1/q06_real.jpg', '/images/round1/q06_ai.jpg', 'The AI street photo contains unreadable text artifacts on neon signs.'),
(1, 'image_comparison', 'Which workspace photo was generated by Midjourney?', '/images/round1/q07_real.jpg', '/images/round1/q07_ai.jpg', 'The AI workspace exhibits distorted keyboard key shapes.'),
(1, 'image_comparison', 'Spot the AI-generated nature waterfall:', '/images/round1/q08_real.jpg', '/images/round1/q08_ai.jpg', 'The AI waterfall features physics-defying water flow lines.'),
(1, 'image_comparison', 'Which car concept render is AI synthetic art?', '/images/round1/q09_real.jpg', '/images/round1/q09_ai.jpg', 'The AI car concept shows asymmetrical wheel rim geometry.'),
(1, 'image_comparison', 'Which hands photo exhibits AI generation artifacts?', '/images/round1/q10_real.jpg', '/images/round1/q10_ai.jpg', 'The AI hands photo shows unnatural finger blending.'),
(1, 'image_comparison', 'Identify the AI-synthesized astronaut on Mars:', '/images/round1/q11_real.jpg', '/images/round1/q11_ai.jpg', 'The AI astronaut has synthetic visor reflection anomalies.'),
(1, 'image_comparison', 'Which coffee cup photo is AI-generated?', '/images/round1/q12_real.jpg', '/images/round1/q12_ai.jpg', 'The AI coffee cup shows steam patterns defying thermal physics.'),
(1, 'image_comparison', 'Which abstract oil painting is AI diffusion art?', '/images/round1/q13_real.jpg', '/images/round1/q13_ai.jpg', 'The AI painting contains ultra-fine pixel noise without canvas texture.'),
(1, 'image_comparison', 'Spot the AI-rendered vintage camera photo:', '/images/round1/q14_real.jpg', '/images/round1/q14_ai.jpg', 'The AI camera has unreadable gibberish dial etchings.'),
(1, 'image_comparison', 'Which robot avatar is AI-generated concept art?', '/images/round1/q15_real.jpg', '/images/round1/q15_ai.jpg', 'The AI robot shows floating panel seams and non-functional wires.'),
(1, 'image_comparison', 'Which interior room design is AI-rendered?', '/images/round1/q16_real.jpg', '/images/round1/q16_ai.jpg', 'The AI room features table legs that do not touch the floor.'),
(1, 'image_comparison', 'Spot the AI-synthesized cat portrait:', '/images/round1/q17_real.jpg', '/images/round1/q17_ai.jpg', 'The AI cat portrait shows irregular pupil shapes and blurred whiskers.'),
(1, 'image_comparison', 'Which concert crowd photo is AI diffusion art?', '/images/round1/q18_real.jpg', '/images/round1/q18_ai.jpg', 'The AI concert photo exhibits face melt on background crowd members.'),
(1, 'image_comparison', 'Which tropical beach resort is AI-generated?', '/images/round1/q19_real.jpg', '/images/round1/q19_ai.jpg', 'The AI resort shows palm trees merging directly into water waves.'),
(1, 'image_comparison', 'Identify the AI-rendered mechanical watch gear:', '/images/round1/q20_real.jpg', '/images/round1/q20_ai.jpg', 'The AI watch gear features non-interlocking gear teeth.');

-- ROUND 2 SEED (20 Logo & Tech MCQ Questions)
INSERT INTO questions (round, question_type, prompt_text, logo_url, options, correct_option, explanation) VALUES
(2, 'logo_mcq', 'Identify this AI laboratory responsible for ChatGPT and GPT-4:', '/images/round2/openai.png', '["OpenAI", "Anthropic", "DeepMind", "Mistral AI"]', 'OpenAI', 'OpenAI created ChatGPT, GPT-4, and DALL-E.'),
(2, 'logo_mcq', 'Which AI safety lab created the Claude LLM series?', '/images/round2/anthropic.png', '["OpenAI", "Anthropic", "Cohere", "Stability AI"]', 'Anthropic', 'Anthropic produces the Claude family of AI models.'),
(2, 'logo_mcq', 'Identify the creator of AlphaFold and Gemini:', '/images/round2/deepmind.png', '["Google DeepMind", "Meta AI", "Microsoft Research", "IBM Watson"]', 'Google DeepMind', 'Google DeepMind created AlphaFold and Gemini.'),
(2, 'logo_mcq', 'Which open-weight AI company created Llama 3?', '/images/round2/meta.png', '["Meta AI", "OpenAI", "Apple AI", "Amazon Bedrock"]', 'Meta AI', 'Meta AI developed the open-source Llama model series.'),
(2, 'logo_mcq', 'Which cloud provider developed the Bedrock AI platform?', '/images/round2/aws.png', '["AWS", "Microsoft Azure", "Google Cloud", "Oracle Cloud"]', 'AWS', 'AWS provides managed foundation models through Bedrock.'),
(2, 'logo_mcq', 'Identify the creator of Stable Diffusion image models:', '/images/round2/stability.png', '["Stability AI", "Midjourney", "Runway", "Flux"]', 'Stability AI', 'Stability AI developed Stable Diffusion.'),
(2, 'logo_mcq', 'Which AI video synthesis startup created Gen-2 and Sora rivals?', '/images/round2/runway.png', '["Runway", "Pika", "Sora", "Synthesia"]', 'Runway', 'Runway built Gen-1, Gen-2, and Gen-3 Alpha video generators.'),
(2, 'logo_mcq', 'Which GPU giant powers 90%+ of global AI model training?', '/images/round2/nvidia.png', '["NVIDIA", "AMD", "Intel", "Qualcomm"]', 'NVIDIA', 'NVIDIA produces H100, B200, and CUDA AI computing platforms.'),
(2, 'logo_mcq', 'Identify this open-source AI model hub & repository:', '/images/round2/huggingface.png', '["Hugging Face", "GitHub", "Kaggle", "Replicate"]', 'Hugging Face', 'Hugging Face is the premier hub for open AI models and datasets.'),
(2, 'logo_mcq', 'Which French AI startup created Mixtral 8x7B?', '/images/round2/mistral.png', '["Mistral AI", "Aleph Alpha", "LightOn", "Kyutai"]', 'Mistral AI', 'Mistral AI produces open and commercial European LLMs.'),
(2, 'logo_mcq', 'Which AI search engine answers queries with cited web sources?', '/images/round2/perplexity.png', '["Perplexity AI", "SearchGPT", "You.com", "DuckDuckGo"]', 'Perplexity AI', 'Perplexity AI combines web search with real-time LLM summaries.'),
(2, 'logo_mcq', 'Which enterprise AI search platform created Command R+?', '/images/round2/cohere.png', '["Cohere", "AI21 Labs", "Writer", "Glean"]', 'Cohere', 'Cohere builds enterprise RAG and LLM systems.'),
(2, 'logo_mcq', 'Identify the developer of the Copilot AI coding assistant:', '/images/round2/microsoft.png', '["Microsoft", "Apple", "Oracle", "IBM"]', 'Microsoft', 'Microsoft integrated Copilot across Windows, GitHub, and Office.'),
(2, 'logo_mcq', 'Which data platform company acquired Databricks MosaicML?', '/images/round2/databricks.png', '["Databricks", "Snowflake", "Teradata", "Cloudera"]', 'Databricks', 'Databricks powers enterprise data intelligence and Mosaic AI.'),
(2, 'logo_mcq', 'Identify this vector database company built for RAG applications:', '/images/round2/pinecone.png', '["Pinecone", "Weaviate", "Qdrant", "Chroma"]', 'Pinecone', 'Pinecone is a high-performance cloud vector database.'),
(2, 'logo_mcq', 'Which AI music generation platform creates full songs from text?', '/images/round2/suno.png', '["Suno", "Udio", "ElevenLabs", "Symphony"]', 'Suno', 'Suno AI generates vocal and instrumental music tracks.'),
(2, 'logo_mcq', 'Which leader in AI voice cloning creates hyper-realistic text-to-speech?', '/images/round2/elevenlabs.png', '["ElevenLabs", "Play.ht", "Murf AI", "Descript"]', 'ElevenLabs', 'ElevenLabs provides state-of-the-art voice synthesis and cloning.'),
(2, 'logo_mcq', 'Which data cloud platform built the Cortex AI engine?', '/images/round2/snowflake.png', '["Snowflake", "Databricks", "BigQuery", "Redshift"]', 'Snowflake', 'Snowflake enables enterprise LLM apps inside its data cloud.'),
(2, 'logo_mcq', 'Which company created the Grok AI chatbot and Colossus supercluster?', '/images/round2/xai.png', '["xAI", "Tesla", "Neuralink", "Starlink"]', 'xAI', 'xAI created Grok and built the Memphis supercomputer.'),
(2, 'logo_mcq', 'Identify the AI framework maintained by PyTorch Foundation:', '/images/round2/pytorch.png', '["PyTorch", "TensorFlow", "JAX", "Keras"]', 'PyTorch', 'PyTorch is the leading deep learning framework for AI research.');

-- ROUND 3 SEED (20 Emoji Tech Decode Questions)
INSERT INTO questions (round, question_type, prompt_text, options, correct_option, explanation) VALUES
(3, 'emoji_mcq', '☁️ 💻 🌐', '["Cloud Computing", "Computer Vision", "Blockchain", "Compiler"]', 'Cloud Computing', 'Cloud Computing delivers infrastructure and software over the global internet.'),
(3, 'emoji_mcq', '🔐 👤 🎫', '["Authentication", "Machine Learning", "API Gateway", "Data Mining"]', 'Authentication', 'Authentication verifies digital identity before granting system access.'),
(3, 'emoji_mcq', '👁️ 📷 🤖', '["Computer Vision", "NLP", "Quantum Computing", "Sharding"]', 'Computer Vision', 'Computer Vision enables machines to analyze and interpret visual input.'),
(3, 'emoji_mcq', '📦 🚢 ⚡', '["Containerization (Docker)", "Quantum Computing", "Mainframe", "Data Lake"]', 'Containerization (Docker)', 'Containerization packages application code and dependencies into isolated runtimes.'),
(3, 'emoji_mcq', '🧠 ⚡ 📈', '["Neural Network", "Firewall", "Load Balancer", "DNS Server"]', 'Neural Network', 'Neural Networks mimic brain nodes to process complex pattern relationships.'),
(3, 'emoji_mcq', '💬 🤖 🗣️', '["Chatbot / LLM", "Database Index", "Microservice", "CDN"]', 'Chatbot / LLM', 'Large Language Models process natural language conversation.'),
(3, 'emoji_mcq', '🔍 📚 ⚡', '["Retrieval-Augmented Generation (RAG)", "Garbage Collection", "Bitwise Shift", "Overfitting"]', 'Retrieval-Augmented Generation (RAG)', 'RAG retrieves external factual knowledge to ground LLM responses.'),
(3, 'emoji_mcq', '🎯 📐 🎯', '["Fine-Tuning", "Zero-Shot Learning", "Prompt Injection", "Latency"]', 'Fine-Tuning', 'Fine-Tuning adapts a pre-trained model on domain-specific target data.'),
(3, 'emoji_mcq', '🎨 🖌️ 🤖', '["Generative AI Art", "OCR", "Web Scraping", "Regression"]', 'Generative AI Art', 'Generative models create novel images from text prompts.'),
(3, 'emoji_mcq', '🛡️ 🛑 💉', '["Prompt Injection Defense", "SQL Injection", "XSS Attack", "Buffer Overflow"]', 'Prompt Injection Defense', 'Defenses protect LLMs against malicious adversarial prompt overrides.'),
(3, 'emoji_mcq', '⚡ ⏱️ 🚀', '["Low Latency Inference", "Batch Training", "Cold Storage", "Epoch"]', 'Low Latency Inference', 'Fast inference speed reduces response time for live user requests.'),
(3, 'emoji_mcq', '📊 🏷️ 📌', '["Data Labeling", "Encryption", "Unit Testing", "Recursion"]', 'Data Labeling', 'Data labeling annotates raw data to train supervised machine learning models.'),
(3, 'emoji_mcq', '🌌 ⚛️ 💻', '["Quantum Machine Learning", "Assembly Language", "CSS Flexbox", "RAID Array"]', 'Quantum Machine Learning', 'Quantum computing leverages qubits for high-dimensional AI optimizations.'),
(3, 'emoji_mcq', '🤖 🚗 🛑', '["Autonomous Driving AI", "CI/CD Pipeline", "Static Analysis", "DNS Lookup"]', 'Autonomous Driving AI', 'Self-driving vehicles use AI computer vision and sensor fusion for navigation.'),
(3, 'emoji_mcq', '🔄 🔁 🔁', '["Transformer Attention", "Infinite Loop", "Deadlock", "Memory Leak"]', 'Transformer Attention', 'Attention mechanisms weigh token relationships in sequence modeling.'),
(3, 'emoji_mcq', '🗣️ ➡️ 📝', '["Speech-to-Text (ASR)", "Optical Character Recognition", "Compiler", "Tokenization"]', 'Speech-to-Text (ASR)', 'Automated Speech Recognition converts audio voice into written text.'),
(3, 'emoji_mcq', '📝 ➡️ 🔊', '["Text-to-Speech (TTS)", "Data Compression", "Hash Table", "Load Balancing"]', 'Text-to-Speech (TTS)', 'Text-to-Speech synthesizes human-like voice audio from written text.'),
(3, 'emoji_mcq', '🤖 🤝 👨‍💻', '["Human-in-the-Loop", "Unsupervised Clustering", "Dark Data", "Shadow IT"]', 'Human-in-the-Loop', 'Human-in-the-loop integrates human feedback (RLHF) to align AI output.'),
(3, 'emoji_mcq', ' VECTOR 📐 🗄️', '["Vector Database", "Relational Database", "CSV File", "RAM Cache"]', 'Vector Database', 'Vector databases index high-dimensional embeddings for semantic search.'),
(3, 'emoji_mcq', '⚖️ 📈 📉', '["Model Drift", "Backpropagation", "Gradient Descent", "Cross-Validation"]', 'Model Drift', 'Model drift occurs when real-world data shifts away from training distribution.');
