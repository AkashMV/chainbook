from sqlmodel import Session, SQLModel, create_engine

db_file = "chainbook.db"
db_url = f"sqlite:///{db_file}"

connect_args = {"check_same_thread": False}
engine = create_engine(db_url, connect_args=connect_args)


def create_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
