// Openrouter Api Model object schema

export interface Architecture {
  input_modalities: string[]; // Supported input types: ["file", "image", "text"]
  output_modalities: string[]; // Supported output types: ["text"]
  tokenizer: string; // Tokenization method used
  instruct_type: string | null; // Instruction format type (null if not applicable)
  modality: string;
}

export interface PricingOverride {
  // Condition: applies when total prompt tokens are strictly greater than this threshold
  min_prompt_tokens: number;

  // Condition: applies when current UTC time is within this daily window
  utc_start: number; // Inclusive start as HHMM clock (e.g. 100 = 01:00, 1030 = 10:30)
  utc_end: number; // Exclusive end as HHMM clock (e.g. 400 = 04:00)

  // Overridden prices — same keys and units as the base pricing object
  prompt: string;
  completion: string;
  input_cache_read: string;
  input_cache_write: string;
}

export interface Pricing {
  prompt: string; // Cost per input token
  completion: string; // Cost per output token
  request: string; // Fixed cost per API request
  image: string; // Cost per image input
  web_search: string; // Cost per web search operation
  internal_reasoning: string; // Cost for internal reasoning tokens
  input_cache_read: string; // Cost per cached input token read
  input_cache_write: string; // Cost per cached input token write
  overrides: PricingOverride[]; // Optional conditional pricing overrides (see below)
}

export interface TopProvider {
  context_length: number; // Provider-specific context limit
  max_completion_tokens: number; // Maximum tokens in response
  is_moderated: boolean; // Whether content moderation is applied
}

export interface DESIGNARENA {
  arena: string; // Arena type (e.g. "models", "builders", "agents")
  category: string; // Category within the arena (e.g. "website", "gamedev")
  elo: number; // ELO rating from head-to-head arena battles
  win_rate: number; // Win rate percentage
  rank: number;
}

export interface Benchmarks {
  design_arena: DESIGNARENA[];
}

export interface Model {
  id: string;
  canonical_slug: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: Architecture;
  pricing: Pricing;
  top_provider: TopProvider;
  per_request_limits: string | null;
  supported_parameters: string[];
  default_parameters: object | null;
  expiration_date: string | null;
  benchmarks: Benchmarks | undefined;
}

// User schema
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
}

export interface UserResponse {
  user: User;
}

// Chat welcome response schema
export interface ChatWelcomeTabResponse {
  userName: string;
  onMessageSelect: (message: string) => void;
}

// Chat message form schema
export interface ChatMessageFormResponse {
  initialMessage: string;
  onMessageChange: () => void;
}

// Model selector response schema
export interface ModelSelectorResponse {
  models: Model[];
  selectedModelId: string | null;
  onModelSelect: Dispatch<SetStateAction<string>>;
  className: string;
}

// Create chat with message response schema
export interface Message {
  id: string;
  messageRole: "USER" | "ASSISTANT";
  messageType: "NORMAL" | "ERROR" | "TOOL_CALL";
  content: string;
  model: string | null;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateChatWithMessageResponse =
  | {
      success: true;
      data: Chat;
    }
  | {
      success: false;
      error: string;
    };

// Chat sidebar response
export interface ChatSidebarResponse {
  user: User;
  chats: Chat[];
}
