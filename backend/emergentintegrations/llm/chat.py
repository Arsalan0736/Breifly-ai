import asyncio

class UserMessage:
    def __init__(self, text):
        self.text = text

class LlmChat:
    def __init__(self, api_key=None, session_id=None, system_message=None):
        self.system_message = system_message

    def with_model(self, provider, model):
        pass

    async def send_message(self, message):
        # Simulate network delay
        await asyncio.sleep(1)
        
        # Return a dummy response that triggers brief creation
        return """Here is a brief based on your request:

## Brief: Generated Campaign Brief
**Objective:** Launch the new Q1 marketing campaign to increase brand awareness.
**Deliverables:**
- Social media assets
- Email newsletter
- Landing page update
**Deadline:** 2024-03-31
**Owners:** Marketing Team
**Assets:** https://drive.google.com/drive/folders/example
**Open Questions:**
- What is the budget?
- Who is the primary target audience?
"""
