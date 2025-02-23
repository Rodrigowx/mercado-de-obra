from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from consulta import buscar_chaves_servicos

app = FastAPI(title="API Mercado de Obra")

# 🔹 Configuração de CORS para permitir chamadas de qualquer origem (Ajuste conforme necessário)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pode restringir a domínios específicos se necessário
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Definição das classes Pydantic
class ServicoRequest(BaseModel):
    nome: str
    quantidade: float
    unidade: str

class ServicoResponseItem(BaseModel):
    classe_principal: str
    chave_servico: str

class ServicoResult(BaseModel):
    servico_input: ServicoRequest
    chaves_relevantes: List[ServicoResponseItem]

@app.post("/consulta_servicos", response_model=List[ServicoResult])
def consulta_servicos(servicos: List[ServicoRequest]):
    """
    Endpoint para buscar as chaves de serviço mais relevantes com base nos inputs do usuário.
    """
    try:
        # 🔹 Correção: `dict()` foi substituído por `model_dump()` para compatibilidade com Pydantic v2
        resultados = buscar_chaves_servicos([s.model_dump() for s in servicos], k=3)
        return resultados
    except Exception as e:
        return [{"error": str(e)}]  # Mantém a resposta estruturada

# 🔹 Execução do servidor FastAPI (apenas se rodar este script diretamente)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
