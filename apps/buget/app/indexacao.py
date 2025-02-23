import json
import time
import openai
import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone as LC_Pinecone
from langchain.docstore.document import Document

# 🔹 Carregar as variáveis do .env
load_dotenv()

# 🔹 Configuração das APIs (agora puxando do .env)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")  # Valor padrão

# 🔹 Definir as chaves
openai.api_key = OPENAI_API_KEY
pc = Pinecone(api_key=PINECONE_API_KEY)
INDEX_NAME = "mercado-de-obra"

def json_to_documents(data: dict):
    """Converte JSON para documentos LangChain"""
    docs = []
    for classe_principal, servicos_dict in data.items():
        for servico_key in servicos_dict:
            texto_base = f"{servico_key}. Classe: {classe_principal}."
            metadata = {"classe_principal": classe_principal, "chave_servico": servico_key}
            docs.append(Document(page_content=texto_base, metadata=metadata))
    return docs

def index_docs_in_pinecone(docs):
    """Indexa documentos no Pinecone sem recriar índice"""
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-ada-002",
        openai_api_key=OPENAI_API_KEY
    )

    # 🔹 Verifica se o índice já existe antes de tentar criá-lo
    existing_indexes = [idx["name"] for idx in pc.list_indexes()]
    if INDEX_NAME not in existing_indexes:
        print(f"🔹 Criando índice {INDEX_NAME} no Pinecone...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,  
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region=PINECONE_ENVIRONMENT)  
        )
        print(f"🔹 Índice {INDEX_NAME} criado. Aguardando inicialização...")
        while not pc.describe_index(INDEX_NAME)["status"]["ready"]:
            time.sleep(1)
    else:
        print(f"✅ O índice '{INDEX_NAME}' já existe. Continuando...")

    # 🔹 Conectando ao índice sem tentar criá-lo, removendo `environment`
    vectorstore = LC_Pinecone.from_documents(
        documents=docs,
        embedding=embedding_function,
        index_name=INDEX_NAME,
        pinecone_api_key=PINECONE_API_KEY  # 🔹 Removido `environment`
    )

    print(f"✅ {len(docs)} documentos indexados com sucesso no Pinecone!")

def main():
    with open("dados.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    docs = json_to_documents(data)
    print(f"📄 Total de documentos gerados: {len(docs)}")

    index_docs_in_pinecone(docs)

if __name__ == "__main__":
    main()
