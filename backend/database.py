from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str

    wallets: List["Wallet"] = Relationship(back_populates="owner")


class Wallet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    address: str = Field(index=True)
    chain: str
    risk_level: str
    notes: Optional[str] = None

    owner_id: int = Field(foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="wallets")
