"""
Enhanced Claude Chatbot with DeFi Knowledge Base
Provides intelligent responses using real market data and comprehensive product knowledge
"""
import os
from typing import Dict, Optional, Any
from pydantic import BaseModel

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from defi_knowledge_base import knowledge_base, get_market_context, get_product_context
    KNOWLEDGE_BASE_AVAILABLE = True
except ImportError:
    KNOWLEDGE_BASE_AVAILABLE = False


class ChatRequest(BaseModel):
    """Chat request model"""
    question: str
    context: Optional[Dict[str, Any]] = None
    include_market_data: bool = True


class ChatResponse(BaseModel):
    """Chat response model"""
    answer: str
    sources: list[str]
    market_data_included: bool


class EnhancedChatbot:
    """Claude-powered chatbot with DeFi knowledge"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = Anthropic(api_key=self.api_key)
        else:
            self.client = None

    async def answer_question(
        self,
        question: str,
        context: Optional[Dict] = None,
        include_market_data: bool = True,
        messages: Optional[list] = None
    ) -> ChatResponse:
        """
        Answer user question using knowledge base and Claude AI

        Args:
            question: User's question
            context: Additional context (wallet balance, product focus, etc.)
            include_market_data: Whether to include live market data

        Returns:
            ChatResponse with answer and sources
        """
        if not self.client:
            return self._get_fallback_response(question)

        # Build comprehensive context
        full_context = await self._build_context(question, context, include_market_data)

        # Build system prompt
        system_prompt = """You are a helpful DeFi assistant specializing in ether.fi products and Ethereum staking.

Your role:
- Explain DeFi concepts in simple, beginner-friendly language
- Provide accurate information about ether.fi products (eETH, weETH, ETHFI, eBTC)
- Include relevant risks and considerations
- Use real market data when available
- Be concise but thorough
- Always include "*Educational only — not financial advice.*" at the end (in italics)

FORMATTING RULES (use Markdown):
- Use **bold** for important numbers, key terms, and emphasis
- Use bullet points (- or •) for lists
- Use proper headings (# or ##) only when needed
- Keep paragraphs short and scannable
- Use line breaks to separate ideas
- Format risks clearly with **Key risks:** prefix
- Put portfolio values in **bold** (e.g., **$16,200**, **5.0 weETH**)

Guidelines:
- Personalize responses based on user's portfolio context
- Start with a friendly greeting if first message
- Use simple analogies for complex concepts
- Mention specific numbers from market data when relevant
- Highlight both opportunities AND risks
- Suggest actionable next steps
- Keep answers concise but comprehensive"""

        # Build user prompt
        user_prompt = f"""
{full_context}

User Question: {question}

Please provide a helpful, accurate answer using the context above. Include relevant data points and always mention key risks.
"""

        try:
            # Build messages array for Claude
            claude_messages = []
            
            # If conversation history provided, use it (excluding system greeting)
            if messages and len(messages) > 1:
                # IMPORTANT: Prepend portfolio context to the conversation
                # Find the first user message and inject context
                context_injected = False
                for i, msg in enumerate(messages):
                    if msg.get('role') in ['user', 'assistant']:
                        if msg['role'] == 'user' and not context_injected:
                            # Inject portfolio context into first user message
                            enhanced_content = f"{full_context}\n\n---\n\nUser Question: {msg['content']}"
                            claude_messages.append({
                                "role": "user",
                                "content": enhanced_content
                            })
                            context_injected = True
                        else:
                            # Regular message
                            claude_messages.append({
                                "role": msg['role'],
                                "content": msg['content']
                            })
            else:
                # First message - include full context
                claude_messages.append({
                    "role": "user",
                    "content": user_prompt
                })
            
            # Call Claude API with conversation history
            response = self.client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=500,
                temperature=0.3,
                system=system_prompt,
                messages=claude_messages
            )

            answer = response.content[0].text.strip()

            # Add disclaimer if not present
            if "not financial advice" not in answer.lower():
                answer += "\n\nEducational only — not financial advice."

            # Extract sources
            sources = self._extract_sources(full_context)

            return ChatResponse(
                answer=answer,
                sources=sources,
                market_data_included=include_market_data
            )

        except Exception as e:
            print(f"Error calling Claude API: {e}")
            return self._get_fallback_response(question)

    async def _build_context(
        self,
        question: str,
        user_context: Optional[Dict],
        include_market_data: bool
    ) -> str:
        """Build comprehensive context for Claude"""
        context_parts = []

        # 1. Market data
        if include_market_data and KNOWLEDGE_BASE_AVAILABLE:
            try:
                market_context = await get_market_context()
                context_parts.append(market_context)
            except:
                pass

        # 2. Detect relevant products in question
        question_lower = question.lower()
        products_mentioned = []

        for product in ["eETH", "weETH", "ETHFI", "eBTC"]:
            if product.lower() in question_lower:
                products_mentioned.append(product)

        # Add product context
        if products_mentioned and KNOWLEDGE_BASE_AVAILABLE:
            for product in products_mentioned:
                try:
                    product_info = get_product_context(product)
                    context_parts.append(product_info)
                except:
                    pass

        # 3. Detect relevant concepts
        concepts_map = {
            "liquid staking": "liquid_staking",
            "restaking": "restaking",
            "eigenlayer": "restaking",
            "apy": "apy_vs_apr",
            "apr": "apy_vs_apr",
            "dvt": "dvt",
            "slashing": "slashing",
            "ltv": "ltv",
            "loan": "ltv"
        }

        concepts_to_include = set()
        for trigger, concept_key in concepts_map.items():
            if trigger in question_lower:
                concepts_to_include.add(concept_key)

        # Add concept context
        if concepts_to_include and KNOWLEDGE_BASE_AVAILABLE:
            for concept_key in concepts_to_include:
                try:
                    concept_info = knowledge_base.get_concept_info(concept_key)
                    if concept_info:
                        context_parts.append(f"""
{concept_info['name']}:
{concept_info['simple_explanation']}
{concept_info.get('detailed_explanation', '')}
""")
                except:
                    pass

        # 4. User-provided context
        if user_context:
            context_parts.append(f"\nUser Context: {user_context}")

        return "\n\n---\n\n".join(context_parts)

    def _extract_sources(self, context: str) -> list[str]:
        """Extract data sources from context"""
        sources = []

        if "Current Market Data (REAL_APIS)" in context:
            sources.extend(["DefiLlama", "Beaconcha.in", "Uniswap", "EigenExplorer"])
        elif "Current Market Data (MOCK)" in context:
            sources.append("Demo Data")

        if "eETH" in context or "weETH" in context:
            sources.append("ether.fi Documentation")

        return list(set(sources))

    def _get_fallback_response(self, question: str) -> ChatResponse:
        """Fallback response when Claude API is unavailable"""
        question_lower = question.lower()

        # Simple keyword matching for common questions
        if any(word in question_lower for word in ["eeth", "staking", "stake"]):
            answer = "eETH is ether.fi's liquid staking token. When you stake ETH, you receive eETH which earns ~3-4% APY. eETH is a rebasing token, meaning your balance grows automatically. You can use eETH in DeFi while still earning staking rewards. Key risks include smart contract risk and validator slashing risk (mitigated by DVT protection).\n\nEducational only — not financial advice."

        elif "weeth" in question_lower:
            answer = "weETH is a wrapped, non-rebasing version of eETH designed for better DeFi compatibility. Instead of your balance increasing, the weETH/ETH price rises over time. It's perfect for DEX liquidity pools and lending protocols. You can wrap/unwrap between eETH and weETH anytime.\n\nEducational only — not financial advice."

        elif any(word in question_lower for word in ["risk", "safe", "dangerous"]):
            answer = "Main risks in liquid staking include: (1) Smart contract bugs, (2) Validator slashing if they misbehave, (3) Liquid staking derivative losing peg to ETH. ether.fi mitigates these with audited contracts, DVT protection for validators, and deep liquidity pools. However, no DeFi protocol is 100% risk-free.\n\nEducational only — not financial advice."

        elif "apy" in question_lower or "yield" in question_lower:
            answer = "ether.fi liquid staking tokens (eETH/weETH) currently earn ~3-4% APY from native Ethereum staking rewards. You can increase yields by restaking via EigenLayer for additional rewards, or using weETH as collateral to borrow and deploy stablecoins to higher-yield protocols. Higher yields = higher risks.\n\nEducational only — not financial advice."

        else:
            answer = "I can help you with questions about ether.fi products (eETH, weETH, ETHFI), liquid staking, DeFi concepts, yields, and risks. For full functionality, please configure the ANTHROPIC_API_KEY.\n\nEducational only — not financial advice."

        return ChatResponse(
            answer=answer,
            sources=["Fallback Responses"],
            market_data_included=False
        )


# Convenience function for API endpoint
async def ask_chatbot(question: str, context: Optional[Dict] = None, messages: Optional[list] = None) -> Dict[str, Any]:
    """Ask the enhanced chatbot a question with optional conversation history"""
    chatbot = EnhancedChatbot()
    response = await chatbot.answer_question(question, context, include_market_data=True, messages=messages)
    return response.dict()


# Test function
async def test_chatbot():
    """Test the enhanced chatbot"""
    print("=" * 60)
    print("Testing Enhanced Chatbot")
    print("=" * 60)

    chatbot = EnhancedChatbot()

    questions = [
        "What is eETH and how does it work?",
        "Is liquid staking risky?",
        "What's the current APY for weETH?",
        "Should I use eETH or weETH?",
        "How can I maximize my yield?"
    ]

    for i, question in enumerate(questions, 1):
        print(f"\nQ{i}: {question}")
        response = await chatbot.answer_question(question)
        print(f"A{i}: {response.answer}")
        print(f"Sources: {', '.join(response.sources)}")
        print("-" * 60)


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_chatbot())
