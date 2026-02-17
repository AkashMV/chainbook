from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import Session, select
from starlette.types import HTTPExceptionHandler

from database import create_db, get_session
from models import User, Wallet

SECRET_KEY = "thisissecret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY = 30


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    yield


app = FastAPI(title="Chainbook API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], depreciated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plaintext, hashed):
    return pwd_context.verify(plaintext, hashed)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_token(data: dict):
    to_encode = data.copy()
    expiry = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRY)
    to_encode.update({"exp": expiry})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate user credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user


# SCHEMAS


class UserCreate(BaseModel):
    email: str
    password: str


class WalletCreate(BaseModel):
    label: str
    address: str
    chain: str
    risk_level: str
    notes: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


@app.post("/register", response_model=Token)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    user_exists = session.exec(select(User).where(User.email == user_data.email))
    if user_exists:
        raise HTTPException(
            status_code=400, detail="Account already exists with given email"
        )

    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pwd)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    access_token = create_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "beared"}


@app.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me")
def read_users_curr(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "id": current_user.id}


# wallet


@app.get("/wallets/", response_model=List[Wallet])
def read_wallets(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return current_user.wallets


@app.post("/wallets/", response_model=Wallet)
def create_wallet(
    wallet_data: WalletCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    new_wallet = Wallet.from_orm(wallet_data)
    new_wallet.owner_id = current_user.id
    session.add(new_wallet)
    session.commit()
    session.refresh(new_wallet)
    return new_wallet


@app.delete("/wallets/{wallet_id}")
def delete_wallet(
    wallet_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    wallet = session.get(Wallet, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet Not Found")
    if wallet.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not Authorized")
    session.delete(wallet)
    session.commit()
    return {"ok": True}
