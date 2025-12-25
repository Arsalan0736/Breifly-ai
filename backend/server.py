from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
use_mock_db = os.environ.get('USE_MOCK_DB', 'false').lower() == 'true'

if use_mock_db:
    logger.info("Using Mock Database (In-Memory)")
    class MockCursor:
        def __init__(self, data):
            self.data = data
        def sort(self, key, direction):
            reverse = direction == -1
            self.data.sort(key=lambda x: x.get(key, ""), reverse=reverse)
            return self
        async def to_list(self, length):
            return self.data[:length]

    class MockCollection:
        def __init__(self):
            self.data = []
        async def find_one(self, query, projection=None):
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    return doc
            return None
        async def insert_one(self, doc):
            self.data.append(doc)
            return True
        def find(self, query, projection=None):
            results = []
            for doc in self.data:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(doc)
            return MockCursor(results)
        async def update_one(self, query, update):
            doc = await self.find_one(query)
            if doc:
                if "$set" in update:
                    doc.update(update["$set"])
                if "$push" in update:
                    for k, v in update["$push"].items():
                        if k not in doc: doc[k] = []
                        if "$each" in v:
                            doc[k].extend(v["$each"])
                        else:
                            doc[k].append(v)
                return type('obj', (object,), {'matched_count': 1})
            return type('obj', (object,), {'matched_count': 0})
        async def delete_one(self, query):
            doc = await self.find_one(query)
            if doc:
                self.data.remove(doc)
                return type('obj', (object,), {'deleted_count': 1})
            return type('obj', (object,), {'deleted_count': 0})

    class MockDB:
        def __init__(self):
            self.users = MockCollection()
            self.briefs = MockCollection()
            self.conversations = MockCollection()

    db = MockDB()
    client = None
else:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'brieflyai-secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

app = FastAPI(title="BrieflyAI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")


# ======================== MODELS ========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class BriefCreate(BaseModel):
    title: str
    objective: Optional[str] = ""
    deliverables: Optional[List[str]] = []
    deadline: Optional[str] = ""
    owners: Optional[List[str]] = []
    assets: Optional[List[str]] = []
    open_questions: Optional[List[str]] = []
    source_type: Optional[str] = "manual"
    source_content: Optional[str] = ""

class BriefUpdate(BaseModel):
    title: Optional[str] = None
    objective: Optional[str] = None
    deliverables: Optional[List[str]] = None
    deadline: Optional[str] = None
    owners: Optional[List[str]] = None
    assets: Optional[List[str]] = None
    open_questions: Optional[List[str]] = None
    status: Optional[str] = None

class BriefResponse(BaseModel):
    id: str
    user_id: str
    title: str
    objective: str
    deliverables: List[str]
    deadline: str
    owners: List[str]
    assets: List[str]
    open_questions: List[str]
    source_type: str
    source_content: str
    status: str
    created_at: str
    updated_at: str

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None
    brief_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    brief: Optional[BriefResponse] = None

class IntegrationStatus(BaseModel):
    name: str
    connected: bool
    last_sync: Optional[str] = None

class ExportRequest(BaseModel):
    brief_id: str
    destination: str  # asana, clickup, sheets

class ExportResponse(BaseModel):
    success: bool
    message: str
    export_url: Optional[str] = None

# ======================== HELPERS ========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ======================== AUTH ROUTES ========================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "created_at": now
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email)
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, created_at=now)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ======================== BRIEFS ROUTES ========================

@api_router.post("/briefs", response_model=BriefResponse)
async def create_brief(brief_data: BriefCreate, current_user: dict = Depends(get_current_user)):
    brief_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    brief_doc = {
        "id": brief_id,
        "user_id": current_user["id"],
        "title": brief_data.title,
        "objective": brief_data.objective or "",
        "deliverables": brief_data.deliverables or [],
        "deadline": brief_data.deadline or "",
        "owners": brief_data.owners or [],
        "assets": brief_data.assets or [],
        "open_questions": brief_data.open_questions or [],
        "source_type": brief_data.source_type or "manual",
        "source_content": brief_data.source_content or "",
        "status": "draft",
        "created_at": now,
        "updated_at": now
    }
    await db.briefs.insert_one(brief_doc)
    del brief_doc["_id"]
    return BriefResponse(**brief_doc)

@api_router.get("/briefs", response_model=List[BriefResponse])
async def list_briefs(current_user: dict = Depends(get_current_user)):
    briefs = await db.briefs.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    return [BriefResponse(**b) for b in briefs]

@api_router.get("/briefs/{brief_id}", response_model=BriefResponse)
async def get_brief(brief_id: str, current_user: dict = Depends(get_current_user)):
    brief = await db.briefs.find_one(
        {"id": brief_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return BriefResponse(**brief)

@api_router.put("/briefs/{brief_id}", response_model=BriefResponse)
async def update_brief(brief_id: str, brief_data: BriefUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in brief_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.briefs.update_one(
        {"id": brief_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brief not found")
    
    brief = await db.briefs.find_one({"id": brief_id}, {"_id": 0})
    return BriefResponse(**brief)

@api_router.delete("/briefs/{brief_id}")
async def delete_brief(brief_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.briefs.delete_one({"id": brief_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brief not found")
    return {"message": "Brief deleted"}

# ======================== AI CHAT ROUTES ========================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    # Get or create conversation
    conversation = await db.conversations.find_one({"id": conversation_id, "user_id": current_user["id"]})
    if not conversation:
        conversation = {
            "id": conversation_id,
            "user_id": current_user["id"],
            "messages": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.conversations.insert_one(conversation)
    
    # Store user message
    user_msg = {
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        # Initialize AI chat
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"brieflyai-{conversation_id}",
            system_message="""You are BrieflyAI, an AI assistant that helps create structured creative briefs from conversations.

When a user asks you to create a brief, extract the following information and format it as a structured brief:
- Objective: The main goal of the campaign/project
- Deliverables: List of specific items to be created
- Deadline: When the work needs to be completed
- Owners: People responsible for different parts
- Assets: Any resources, links, or materials needed
- Open Questions: Things that still need clarification

Always respond in a helpful, professional tone. When generating a brief, use clear sections and bullet points.

If the user provides Slack messages or email content, analyze them and extract the relevant brief information.

Format your brief responses like this:
## Brief: [Title]
**Objective:** [Clear objective]
**Deliverables:**
- [Item 1]
- [Item 2]
**Deadline:** [Date if mentioned]
**Owners:** [Names if mentioned]
**Assets:** [Links/resources if any]
**Open Questions:**
- [Question 1]
- [Question 2]"""
        )
        chat.with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.message)
        ai_response = await chat.send_message(user_message)
        
        # Store AI response
        ai_msg = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation_id},
            {"$push": {"messages": {"$each": [user_msg, ai_msg]}}}
        )
        
        # Check if response contains a brief and auto-create it
        brief = None
        if "## Brief:" in ai_response or "**Objective:**" in ai_response:
            # Extract title from response
            lines = ai_response.split('\n')
            title = "Generated Brief"
            for line in lines:
                if line.startswith("## Brief:"):
                    title = line.replace("## Brief:", "").strip()
                    break
            
            # Create brief
            brief_id = str(uuid.uuid4())
            now = datetime.now(timezone.utc).isoformat()
            brief_doc = {
                "id": brief_id,
                "user_id": current_user["id"],
                "title": title,
                "objective": "",
                "deliverables": [],
                "deadline": "",
                "owners": [],
                "assets": [],
                "open_questions": [],
                "source_type": "ai",
                "source_content": request.message,
                "status": "draft",
                "created_at": now,
                "updated_at": now
            }
            
            # Parse brief content
            current_section = None
            for line in lines:
                line = line.strip()
                if line.startswith("**Objective:**"):
                    brief_doc["objective"] = line.replace("**Objective:**", "").strip()
                elif line.startswith("**Deadline:**"):
                    brief_doc["deadline"] = line.replace("**Deadline:**", "").strip()
                elif line.startswith("**Deliverables:**"):
                    current_section = "deliverables"
                elif line.startswith("**Owners:**"):
                    current_section = "owners"
                    owner_text = line.replace("**Owners:**", "").strip()
                    if owner_text:
                        brief_doc["owners"].append(owner_text)
                elif line.startswith("**Assets:**"):
                    current_section = "assets"
                elif line.startswith("**Open Questions:**"):
                    current_section = "open_questions"
                elif line.startswith("- ") and current_section:
                    item = line[2:].strip()
                    if item and current_section in brief_doc:
                        brief_doc[current_section].append(item)
            
            await db.briefs.insert_one(brief_doc)
            brief = BriefResponse(**{k: v for k, v in brief_doc.items() if k != "_id"})
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            brief=brief
        )
        
    except Exception as e:
        logger.error(f"AI Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/conversations", response_model=List[dict])
async def list_conversations(current_user: dict = Depends(get_current_user)):
    conversations = await db.conversations.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return conversations

@api_router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    conversation = await db.conversations.find_one(
        {"id": conversation_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

# ======================== INTEGRATIONS (MOCKED) ========================

@api_router.get("/integrations", response_model=List[IntegrationStatus])
async def get_integrations(current_user: dict = Depends(get_current_user)):
    # Mocked integrations
    return [
        IntegrationStatus(name="slack", connected=False, last_sync=None),
        IntegrationStatus(name="gmail", connected=False, last_sync=None),
        IntegrationStatus(name="asana", connected=False, last_sync=None),
        IntegrationStatus(name="clickup", connected=False, last_sync=None),
        IntegrationStatus(name="google_sheets", connected=False, last_sync=None),
    ]

@api_router.post("/integrations/{integration_name}/connect")
async def connect_integration(integration_name: str, current_user: dict = Depends(get_current_user)):
    # Mocked connection
    valid_integrations = ["slack", "gmail", "asana", "clickup", "google_sheets"]
    if integration_name not in valid_integrations:
        raise HTTPException(status_code=400, detail="Invalid integration")
    
    return {
        "message": f"{integration_name} connection initiated",
        "auth_url": f"https://example.com/oauth/{integration_name}?demo=true"
    }

@api_router.post("/export", response_model=ExportResponse)
async def export_brief(request: ExportRequest, current_user: dict = Depends(get_current_user)):
    # Verify brief exists
    brief = await db.briefs.find_one(
        {"id": request.brief_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    
    # Mocked export
    valid_destinations = ["asana", "clickup", "sheets"]
    if request.destination not in valid_destinations:
        raise HTTPException(status_code=400, detail="Invalid export destination")
    
    # Update brief status
    await db.briefs.update_one(
        {"id": request.brief_id},
        {"$set": {"status": "exported", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return ExportResponse(
        success=True,
        message=f"Brief exported to {request.destination} successfully (Demo Mode)",
        export_url=f"https://example.com/{request.destination}/task/demo-123"
    )

# ======================== HEALTH CHECK ========================

@api_router.get("/")
async def root():
    return {"message": "BrieflyAI API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
