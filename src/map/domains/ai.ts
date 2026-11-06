// name | aliases | kind | year | weight | definition | related
// kinds: t tool, l language, c concept, p practice, i ideology, s standard
export default `
@Foundations
Machine Learning | ml | c | 1959 | 3 | Software that learns patterns from data instead of following written rules. | Neural Network; Supervised Learning; Deep Learning
Supervised Learning | | c | 1960 | 3 | Training on labelled examples so a model can predict labels for new ones. | Machine Learning; Classification; Regression
Unsupervised Learning | | c | 1960 | 2 | Finding structure in data that has no labels. | Machine Learning; Clustering
Reinforcement Learning | rl | c | 1989 | 2 | Learning by trial and error to maximise a reward. | Machine Learning; AlphaGo
Classification | classifier | c | 1960 | 2 | Predicting which category something belongs to. | Supervised Learning; Decision Tree
Regression | linear regression, logistic regression | c | 1950 | 2 | Predicting a number from a set of inputs. | Supervised Learning
Clustering | k-means, kmeans | c | 1967 | 2 | Grouping similar items without being told the groups. | Unsupervised Learning
Decision Tree | decision trees | c | 1984 | 2 | A model that predicts by asking a chain of yes or no questions. | Random Forest; Classification
Random Forest | | c | 2001 | 1 | Many decision trees voting together. | Decision Tree; Gradient Boosting
Gradient Boosting | xgboost, lightgbm | c | 2001 | 2 | Trees built in sequence, each fixing the last one's mistakes. | Random Forest; Scikit-learn
Feature Engineering | features | p | 1990 | 2 | Turning raw data into inputs a model can learn from. | Machine Learning
Overfitting | underfitting | c | 1990 | 3 | When a model memorises its training data and fails on anything new. | Machine Learning; Gradient Descent
Gradient Descent | sgd, stochastic gradient descent | c | 1960 | 3 | Nudging a model's weights downhill until its error shrinks. | Backpropagation; Neural Network
Backpropagation | backprop | c | 1986 | 2 | Working out how much each weight contributed to the error. | Gradient Descent; Neural Network
Scikit-learn | sklearn | t | 2010 | 2 | The standard Python library for classic machine learning. | Python; Machine Learning

@Neural networks
Deep Learning | dl | c | 2012 | 3 | Machine learning with neural networks many layers deep. | Neural Network; Machine Learning; GPU
Neural Network | neural networks, nn, ann | c | 1958 | 3 | Layers of simple connected units that learn by adjusting their weights. | Deep Learning; Backpropagation
CNN | convolutional neural network, convolutional neural networks, convnet | c | 1998 | 2 | A network that scans images for patterns at growing scales. | Computer Vision; Neural Network
RNN | recurrent neural network, recurrent neural networks | c | 1986 | 2 | A network that reads sequences one step at a time. | LSTM; Neural Network
LSTM | long short-term memory | c | 1997 | 1 | An RNN that can remember things over longer sequences. | RNN
Transformer | transformers, attention is all you need | c | 2017 | 3 | The attention-based architecture behind modern language models. | Attention; LLM; Deep Learning
Attention | self-attention, attention mechanism | c | 2014 | 2 | Letting a model weigh which inputs matter most right now. | Transformer
GAN | generative adversarial network, generative adversarial networks, gans | c | 2014 | 2 | Two networks competing, one faking data and one catching fakes. | Deepfake; Neural Network
Diffusion Model | diffusion models | c | 2020 | 2 | Generating images by learning to remove noise step by step. | Stable Diffusion; Midjourney; Deep Learning
Autoencoder | autoencoders, vae, variational autoencoder | c | 1986 | 1 | A network that compresses data and rebuilds it. | Neural Network; Embedding
Embedding | embeddings, vector embedding, vector embeddings, word2vec | c | 2013 | 3 | Text or images turned into numbers where similar things sit close. | Vector Database; Semantic Search; Transformer
PyTorch | torch | t | 2016 | 3 | The most popular framework for building neural networks. | Python; Deep Learning; TensorFlow
TensorFlow | tf | t | 2015 | 2 | Google's framework for building and deploying neural networks. | PyTorch; Keras
JAX | | t | 2018 | 1 | Google's numerical library for fast research on accelerators. | PyTorch; NumPy
Keras | | t | 2015 | 1 | A friendly high-level API for building neural networks. | TensorFlow
ONNX | | s | 2017 | 1 | A shared file format for moving models between frameworks. | PyTorch

@Language models
LLM | large language model, large language models, llms | c | 2020 | 3 | A model trained on huge amounts of text to predict what comes next. | Transformer; Token; Prompt Engineering; ChatGPT
GPT | generative pre-trained transformer, gpt-4, gpt-5, gpt-3 | c | 2018 | 2 | OpenAI's family of large language models. | LLM; ChatGPT
ChatGPT | | t | 2022 | 3 | OpenAI's chatbot, the product that took LLMs mainstream. | GPT; LLM
Claude | anthropic, anthropic claude | t | 2023 | 3 | Anthropic's family of AI models and its assistant. | LLM; Claude Code; AI Safety
Gemini | google gemini, bard | t | 2023 | 2 | Google's family of multimodal AI models. | LLM; Multimodal
Grok | xai, xai grok | t | 2023 | 2 | xAI's chatbot and family of language models. | LLM
Llama | meta llama | t | 2023 | 2 | Meta's family of openly downloadable language models. | Open-weight Model; llama.cpp
Mistral | mistral ai | t | 2023 | 1 | A French AI lab known for efficient open models. | Open-weight Model
DeepSeek | | t | 2023 | 2 | A Chinese lab whose efficient models shook the industry in 2025. | Open-weight Model; Reasoning Model
Qwen | | t | 2023 | 1 | Alibaba's family of openly released language models. | Open-weight Model
Token | tokens, tokenization, tokenizer | c | 2018 | 2 | The small chunks of text a model reads and writes. | LLM; Context Window
Context Window | | c | 2020 | 2 | How much text a model can hold in mind at once. | Token; Context Engineering
Prompt Engineering | prompting, prompt design | p | 2021 | 3 | Writing instructions that get reliable results from a model. | LLM; System Prompt; Context Engineering
Context Engineering | | p | 2025 | 2 | Designing everything a model sees, not just the prompt. | Prompt Engineering; AI Agent; RAG
System Prompt | | c | 2022 | 2 | Standing instructions that shape how a model behaves. | Prompt Engineering
Hallucination | hallucinations | c | 2022 | 2 | When a model states something false with full confidence. | LLM; RAG
Fine-tuning | finetuning, fine tuning | p | 2019 | 2 | Retraining an existing model on your own examples. | Transfer Learning; LLM
Quantization | gguf, model quantization | c | 2022 | 1 | Shrinking a model by storing its numbers at lower precision. | llama.cpp; Inference
Small Language Model | slm, small language models | c | 2023 | 1 | A compact model cheap enough to run on modest hardware. | LLM; Edge AI
Open-weight Model | open weights, open-weight models, open model, open models | c | 2023 | 2 | A model whose trained weights anyone can download and run. | Llama; Hugging Face; Open Source
Reasoning Model | reasoning models, o1, thinking model | c | 2024 | 2 | A model that works through a problem before it answers. | Chain of Thought; LLM
Chain of Thought | cot | p | 2022 | 1 | Having a model reason step by step before answering. | Reasoning Model; Prompt Engineering
Multimodal | multimodal ai | c | 2023 | 2 | Models that handle text, images, audio or video together. | LLM; Gemini
Knowledge Cutoff | training cutoff | c | 2022 | 1 | The date after which a model has seen no training data. | LLM; RAG
Structured Outputs | json mode | c | 2023 | 1 | Forcing a model's reply to match a data schema. | Function Calling; JSON
Function Calling | tool calling, tool use | c | 2023 | 2 | Letting a model request actions from your code. | AI Agent; Structured Outputs; MCP

@Agents & tooling
AI Agent | agents, agentic ai, ai agents, agentic | c | 2023 | 3 | A model that plans and takes actions with tools toward a goal. | Function Calling; MCP; LLM
MCP | model context protocol | s | 2024 | 2 | An open standard for connecting AI apps to tools and data. | AI Agent; Function Calling; Claude
A2A | agent2agent, agent to agent | s | 2025 | 1 | A protocol for AI agents to talk to each other. | MCP; AI Agent
Vibe Coding | | p | 2025 | 2 | Building software by describing it and letting AI write the code. | Claude Code; Cursor; AI Agent
Claude Code | | t | 2025 | 2 | Anthropic's agentic coding tool for the terminal and desktop. | Claude; AI Agent; Vibe Coding
GitHub Copilot | copilot | t | 2021 | 3 | The AI pair programmer inside your editor. | VS Code; LLM; GitHub
Cursor | | t | 2023 | 2 | A code editor built around AI from the ground up. | VS Code; Vibe Coding
Windsurf | | t | 2024 | 1 | An AI-first code editor. | Cursor
Codex | openai codex | t | 2021 | 1 | OpenAI's coding model and agent. | GPT; GitHub Copilot
LangChain | | t | 2022 | 2 | A framework for chaining LLM calls, tools and data. | LLM; RAG; LangGraph
LangGraph | | t | 2024 | 1 | A library for building stateful agents as graphs. | LangChain; AI Agent
LlamaIndex | | t | 2022 | 1 | A framework for connecting LLMs to your own data. | RAG
CrewAI | | t | 2024 | 1 | A framework for teams of cooperating AI agents. | AI Agent
Ollama | | t | 2023 | 2 | The easy way to run open models on your own machine. | Open-weight Model; llama.cpp
LM Studio | | t | 2023 | 1 | A desktop app for running local language models. | Ollama
llama.cpp | | t | 2023 | 1 | A fast C++ engine that runs models on ordinary hardware. | Ollama; Quantization
Hugging Face | huggingface, hf | t | 2016 | 3 | The GitHub of machine learning models and datasets. | Open-weight Model; Transformer
OpenRouter | | t | 2023 | 1 | One API that reaches many model providers. | BYOK; LLM
BYOK | bring your own key | p | 2023 | 1 | Using an app with your own AI API key, on your own bill. | OpenRouter
Human-in-the-loop | hitl, human in the loop | p | 2017 | 1 | Keeping a person in the chain to review an AI's work. | AI Agent

@Retrieval & memory
RAG | retrieval augmented generation, retrieval-augmented generation | p | 2020 | 3 | Looking up relevant documents and handing them to a model. | Vector Database; Embedding; Semantic Search
Vector Database | vector db, vector store, vectordb, vector databases | c | 2019 | 2 | A database built to find the nearest embeddings fast. | Embedding; RAG; Pinecone; pgvector
Pinecone | | t | 2021 | 1 | A hosted vector database. | Vector Database
Qdrant | | t | 2021 | 1 | An open-source vector database written in Rust. | Vector Database
Weaviate | | t | 2019 | 1 | An open-source vector database with built-in search. | Vector Database
Chroma | chromadb | t | 2022 | 1 | A lightweight embedding database popular for prototypes. | Vector Database
pgvector | | t | 2021 | 2 | Vector search as a PostgreSQL extension. | PostgreSQL; Vector Database
Semantic Search | | c | 2018 | 2 | Searching by meaning instead of exact keywords. | Embedding; Full-Text Search
Chunking | | p | 2023 | 1 | Splitting documents into pieces small enough to retrieve. | RAG
Reranking | reranker, re-ranking | p | 2020 | 1 | Reordering search results with a stronger model. | RAG; Semantic Search
GraphRAG | | p | 2024 | 1 | Retrieval that walks a knowledge graph as well as text. | RAG; Knowledge Graph
Knowledge Graph | knowledge graphs | c | 2012 | 2 | Facts stored as entities and the links between them. | GraphRAG; Neo4j
Agent Memory | | c | 2024 | 1 | How an AI agent keeps what it learned between sessions. | AI Agent; Context Engineering

@Training & operations
MLOps | | p | 2018 | 2 | DevOps habits applied to shipping machine learning. | DevOps; MLflow
Transfer Learning | | c | 2010 | 2 | Reusing a trained model as the starting point for a new task. | Fine-tuning
Self-supervised Learning | | c | 2018 | 1 | Learning from data by making up its own labels. | Machine Learning
Evals | llm evals, model evaluation, evaluation | p | 2023 | 2 | Tests that measure how well an AI system really performs. | LLM; Unit Testing
Synthetic Data | | c | 2018 | 1 | Artificial data generated to train or test models. | Machine Learning
Federated Learning | | c | 2016 | 1 | Training across many devices without collecting their data. | Differential Privacy
Knowledge Distillation | distillation, model distillation | c | 2015 | 1 | Teaching a small model to imitate a big one. | Small Language Model
Inference | model inference | c | 2015 | 2 | Running a trained model to get an answer. | GPU; vLLM; Quantization
vLLM | | t | 2023 | 1 | A high-throughput engine for serving language models. | Inference
Weights & Biases | wandb | t | 2018 | 1 | A tool for tracking machine learning experiments. | MLOps
MLflow | | t | 2018 | 1 | An open-source platform for managing the ML lifecycle. | MLOps
Prompt Caching | | p | 2024 | 1 | Reusing the processed start of a prompt to save money. | LLM

@Vision, voice & media
Computer Vision | cv | c | 1966 | 2 | Teaching machines to understand images and video. | CNN; Object Detection
Object Detection | yolo | c | 2015 | 1 | Finding and labelling things inside an image. | Computer Vision
OCR | optical character recognition | c | 1974 | 1 | Turning pictures of text into real text. | Computer Vision
NLP | natural language processing | c | 1960 | 3 | Getting computers to work with human language. | LLM; Machine Learning
Speech Recognition | whisper, asr, speech to text | c | 1980 | 1 | Turning spoken audio into text. | NLP; Text-to-Speech
Text-to-Speech | tts, text to speech | c | 2016 | 1 | Turning written text into natural spoken audio. | Speech Recognition
Stable Diffusion | | t | 2022 | 2 | The open image generator that anyone can run. | Diffusion Model; ComfyUI
Midjourney | | t | 2022 | 2 | An image generator loved for its striking style. | Diffusion Model
DALL-E | dalle, dall e | t | 2021 | 1 | OpenAI's image generator. | Diffusion Model
Sora | | t | 2024 | 1 | OpenAI's model for generating video from text. | Diffusion Model
ComfyUI | | t | 2023 | 1 | A node-based interface for image generation workflows. | Stable Diffusion
AlphaGo | | t | 2016 | 1 | DeepMind's system that beat the world's best Go players. | Reinforcement Learning
AlphaFold | | t | 2020 | 1 | DeepMind's system that predicts how proteins fold. | Deep Learning

@Safety & society
AI Safety | | c | 2015 | 2 | Making sure powerful AI systems don't cause serious harm. | AI Alignment; Claude
AI Alignment | alignment | c | 2014 | 2 | Getting AI to pursue what people actually want. | AI Safety; AGI
Prompt Injection | | c | 2022 | 2 | Hidden instructions that hijack a model through its input. | Jailbreak; SQL Injection; AI Agent
Jailbreak | jailbreaking | c | 2022 | 1 | Tricking a model into ignoring its safety rules. | Prompt Injection; AI Safety
Algorithmic Bias | bias in ai, ai bias | c | 2016 | 2 | When a system learns and repeats unfair patterns. | Explainable AI; Machine Learning
Explainable AI | interpretability, explainability | c | 2016 | 1 | Methods for showing why a model decided what it did. | Algorithmic Bias
AGI | artificial general intelligence | c | 2007 | 2 | AI as capable as a person across almost any task. | Superintelligence; AI Alignment
Turing Test | | c | 1950 | 2 | Can a machine pass for human in conversation? | AGI
Superintelligence | asi | c | 2014 | 1 | AI far beyond human ability at nearly everything. | AGI; Singularity
Model Card | model cards | p | 2019 | 1 | A published report on what a model can and can't do. | AI Safety
Deepfake | deepfakes | c | 2017 | 2 | Convincing fake video or audio made with AI. | GAN
AI Slop | slop | c | 2024 | 1 | Low-effort AI output that floods the internet. | Enshittification
`
