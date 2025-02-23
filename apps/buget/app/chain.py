import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import ChatPromptTemplate
from pinecone import Pinecone

# 🔹 Carregar variáveis de ambiente do .env
load_dotenv()

# 🔹 Configuração das APIs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "mercado-de-obra")

# 🔹 Inicializando cliente Pinecone
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    print("✅ Pinecone inicializado com sucesso.")
except Exception as e:
    print(f"⚠️ Erro ao inicializar Pinecone: {e}")
    exit(1)

def format_doc(doc):
    """
    Formata um documento recuperado do Pinecone, extraindo os campos de metadados
    'classe_principal' e 'chave_servico' (caso existam) e o conteúdo da página.
    """
    classe = doc.metadata.get("classe_principal", "N/A") if hasattr(doc, "metadata") else "N/A"
    chave = doc.metadata.get("chave_servico", "N/A") if hasattr(doc, "metadata") else "N/A"
    return f"Classe Principal: {classe} | Chave Serviço: {chave}\nConteúdo: {doc.page_content}"

def combine_docs(docs):
    """Concatena as informações formatadas dos documentos recuperados pelo Pinecone."""
    return "\n---\n".join([format_doc(d) for d in docs])

# 🔹 Prompt do sistema atualizado para considerar sinônimos e variações
SYSTEM_PROMPT = """
Você é um assistente especializado em serviços de construção. Você recebe um serviço com os seguintes campos: {{nome, quantidade, unidade}}.
Sua missão é analisar o nome do serviço {{nome}}, de acordo com o input, avaliando quais são as etapas de início, meio e fim para a execução do serviço.
Durante esse processo, você deve identificar as 'classe_principal' e 'chave_servico' presentes no CONTEXT (informações do Pinecone) que mais se enquadram no serviço.
**Atenção:** Se o input contiver termos que possam ter sinônimos ou variações – por exemplo, "concretagem" ou "aplicação de concreto" – você deve considerar também documentos que contenham termos relacionados, como "concretagem de vigas e lajes", garantindo que todas as correspondências relevantes sejam incluídas.
Utilize as informações fornecidas no CONTEXT, que incluem os campos 'classe_principal' e 'chave_servico', para associar corretamente o serviço com as chaves relevantes.
Retorne sua resposta exclusivamente em JSON, sem adicionar explicações fora do formato solicitado.

Formato de resposta:
{{
  "resultados": [
    {{
      "servico_input": {{ "nome": "...", "quantidade": 0, "unidade": "..." }},
      "chaves_relevantes": [
        {{ "classe_principal": "...", "chave_servico": "..." }},
        ...
      ]
    }}
  ]
}}
"""

USER_PROMPT = """
CONTEXT (Pinecone):
{context}

SERVICO (JSON):
{question}
"""

PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("user", USER_PROMPT),
])

def buscar_chaves_servicos(servicos, k=10):
    """
    Para cada serviço, utiliza o campo 'nome' para buscar contextos relevantes no Pinecone,
    constrói o prompt utilizando o contexto (que inclui os metadados com 'classe_principal'
    e 'chave_servico') e obtém a resposta do modelo.
    Para evitar problemas de case sensitivity, o nome do serviço é convertido para minúsculas
    antes de realizar a busca.
    """
    # Inicializa a função de embedding
    embedding_function = OpenAIEmbeddings(
        model="text-embedding-ada-002",  # Modelo eficiente e de baixo custo
        openai_api_key=OPENAI_API_KEY
    )
    
    # Conectar ao Pinecone
    try:
        vectorstore = PineconeVectorStore.from_existing_index(
            index_name=PINECONE_INDEX,
            embedding=embedding_function
        )
    except Exception as e:
        print(f"⚠️ Erro ao conectar ao Pinecone: {e}")
        return {"resultados": []}
    
    # Configura o retriever utilizando o parâmetro k aumentado para capturar mais documentos
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    resultados = []
    
    for servico in servicos:
        # Normaliza o campo "nome" para minúsculas para garantir a consistência na busca
        nome_servico = servico.get("nome", "")
        query = nome_servico.lower()
        retrieved_docs = retriever.get_relevant_documents(query)
        context_str = combine_docs(retrieved_docs)
        
        # Converte o serviço para JSON para incluir no prompt (mantém o input original)
        service_json = json.dumps(servico, ensure_ascii=False)
        input_vars = {"context": context_str, "question": service_json}
        prompt_message = PROMPT_TEMPLATE.format(**input_vars)
        
        # Obtém a resposta utilizando o modelo ChatOpenAI
        response = ChatOpenAI(model="gpt-4o-mini", temperature=0)(prompt_message)
        try:
            resp_data = json.loads(response.content)
        except Exception as e:
            raise ValueError(f"Erro ao converter a resposta para JSON: {e}")
        
        # Considera que o resultado esteja em uma lista sob a chave "resultados"
        if "resultados" in resp_data and isinstance(resp_data["resultados"], list):
            result = resp_data["resultados"][0] if resp_data["resultados"] else {}
        else:
            result = resp_data
        
        resultados.append(result)
    
    return {"resultados": resultados}

# 🔹 Criando a API com FastAPI
app = FastAPI(title="API Mercado de Obra")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Definição das classes Pydantic para validação dos dados
class ServicoRequest(BaseModel):
    nome: str
    quantidade: float
    unidade: str

class ServicoResponseItem(BaseModel):
    classe_principal: str
    chave_servico: str

class ResultadoServico(BaseModel):
    servico_input: ServicoRequest
    chaves_relevantes: List[ServicoResponseItem]

class ResponseModel(BaseModel):
    resultados: List[ResultadoServico]

@app.post("/consulta_servicos", response_model=ResponseModel)
def consulta_servicos(servicos: List[ServicoRequest]):
    try:
        servicos_dict = [s.model_dump() for s in servicos]
        resultados_raw = buscar_chaves_servicos(servicos_dict, k=10)
        return ResponseModel(resultados=resultados_raw["resultados"])
    except Exception as e:
        raise HTTPException(500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
