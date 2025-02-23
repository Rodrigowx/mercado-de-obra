import openai
import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import Pinecone as LC_Pinecone

# 🔹 Carregar variáveis do .env
load_dotenv()

# 🔹 Configuração das APIs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "mercado-de-obra"

# 🔹 Configuração do OpenAI
openai.api_key = OPENAI_API_KEY

# 🔹 Inicializando cliente Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

def buscar_chaves_servicos(servicos, k=3):
    """Recebe uma lista de serviços e retorna as chaves mais relevantes do Pinecone."""

    # 🔹 Criar função de embedding
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-ada-002",
        openai_api_key=OPENAI_API_KEY
    )

    # 🔹 Conectar ao Pinecone corretamente
    try:
        vectorstore = LC_Pinecone.from_existing_index(
            index_name=INDEX_NAME,
            embedding=embedding_function
        )
    except Exception as e:
        print(f"⚠️ Erro ao conectar ao Pinecone: {e}")
        return []

    resultados_finais = []

    for servico in servicos:
        consulta_str = f"{servico['nome']} {servico['quantidade']}{servico['unidade']}"
        
        try:
            docs = vectorstore.similarity_search(consulta_str, k=k)
        except Exception as e:
            print(f"⚠️ Erro na busca de '{consulta_str}': {e}")
            docs = []

        chaves_encontradas = [
            {
                "classe_principal": doc.metadata.get("classe_principal", "Desconhecido"),
                "chave_servico": doc.metadata.get("chave_servico", "Desconhecido")
            }
            for doc in docs
        ]

        resultados_finais.append({
            "servico_input": servico,
            "chaves_relevantes": chaves_encontradas
        })

    return resultados_finais

# 🔹 Teste rápido com dados de exemplo
if __name__ == "__main__":
    print('nada')
    # servicos_exemplo = [
    #     {"nome": "construir quarto", "quantidade": 8, "unidade": "m²"},
    #     {"nome": "instalação elétrica", "quantidade": 10, "unidade": "m"}
    # ]
    
    # resultado = buscar_chaves_servicos(servicos_exemplo, k=2)
    
    # import json
    # print("📌 RESULTADO:")
    # print(json.dumps(resultado, indent=2, ensure_ascii=False))
